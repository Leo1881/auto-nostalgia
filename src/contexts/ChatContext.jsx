import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase } from "../lib/supabase";

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, profile } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch user's conversations
  const fetchConversations = useCallback(async () => {
    console.log("ChatContext - fetchConversations called, user:", user);
    console.log("ChatContext - profile:", profile);
    console.log("ChatContext - user details:", {
      id: user?.id,
      role: profile?.role,
      email: user?.email,
    });
    if (!user || !profile) return;

    try {
      setLoading(true);

      // Get accepted assessments based on user role
      let acceptedAssessments = [];

      if (profile.role === "customer") {
        // For customers: get assessments where they are the customer and status is 'approved' only
        const { data: customerAssessments, error: customerError } =
          await supabase
            .from("assessment_requests")
            .select("id, vehicle_id, assigned_assessor_id")
            .eq("user_id", user.id)
            .eq("status", "approved");

        console.log("Customer assessments query:", {
          customerAssessments,
          customerError,
          userId: user.id,
        });
        acceptedAssessments = customerAssessments || [];
      } else if (profile.role === "assessor") {
        // For assessors: get assessments where they are the assessor and status is 'approved' only
        const { data: assessorAssessments, error: assessorError } =
          await supabase
            .from("assessment_requests")
            .select("id, vehicle_id, user_id")
            .eq("assigned_assessor_id", user.id)
            .eq("status", "approved");

        console.log("Assessor assessments query:", {
          assessorAssessments,
          assessorError,
          userId: user.id,
        });
        acceptedAssessments = assessorAssessments || [];
      }

      console.log("Accepted assessments:", acceptedAssessments);

      // Get or create conversations for accepted assessments
      const conversationsWithData = await Promise.all(
        acceptedAssessments.map(async (assessment) => {
          // Get vehicle data for this assessment
          const { data: vehicleData } = await supabase
            .from("vehicles")
            .select("id, year, make, model")
            .eq("id", assessment.vehicle_id)
            .single();

          // Check if conversation already exists
          const { data: existingConversation } = await supabase
            .from("chat_conversations")
            .select("*")
            .eq("assessment_id", assessment.id)
            .single();

          let conversation;
          if (existingConversation) {
            conversation = existingConversation;
          } else {
            // Create new conversation
            const { data: newConversation, error: createError } = await supabase
              .from("chat_conversations")
              .insert({
                assessment_id: assessment.id,
                customer_id:
                  profile.role === "customer" ? user.id : assessment.user_id,
                assessor_id:
                  profile.role === "assessor"
                    ? user.id
                    : assessment.assigned_assessor_id,
              })
              .select("*")
              .single();

            if (createError) {
              console.error("Error creating conversation:", createError);
              return null;
            }
            conversation = newConversation;
          }

          // Get customer data
          const { data: customerData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", conversation.customer_id)
            .single();

          // Get assessor data
          const { data: assessorData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", conversation.assessor_id)
            .single();

          return {
            ...conversation,
            assessment_requests: {
              id: assessment.id,
              vehicle_make: vehicleData?.make || "Unknown",
              vehicle_model: vehicleData?.model || "Unknown",
              vehicle_year: vehicleData?.year || "Unknown",
            },
            customer: customerData,
            assessor: assessorData,
          };
        })
      );

      // Filter out any null conversations (from errors)
      const validConversations = conversationsWithData.filter(
        (conv) => conv !== null
      );
      console.log("Final conversations:", validConversations);
      setConversations(validConversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user, profile]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId) => {
    if (!conversationId) return;

    try {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;

      // Get sender data for each message
      const messagesWithSenders = await Promise.all(
        messages.map(async (message) => {
          const { data: senderData } = await supabase
            .from("profiles")
            .select("id, full_name, email")
            .eq("id", message.sender_id)
            .single();

          return {
            ...message,
            profiles: senderData,
          };
        })
      );

      setMessages(messagesWithSenders || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Send a message
  const sendMessage = useCallback(
    async (
      conversationId,
      messageText,
      messageType = "text",
      fileUrl = null
    ) => {
      if (!user || !conversationId || !messageText.trim()) return;

      try {
        const { data: newMessage, error } = await supabase
          .from("chat_messages")
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            message_text: messageText,
            message_type: messageType,
            file_url: fileUrl,
          })
          .select("*")
          .single();

        if (error) throw error;

        // Get sender data for the new message
        const { data: senderData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .eq("id", user.id)
          .single();

        const messageWithSender = {
          ...newMessage,
          profiles: senderData,
        };

        // Add new message to local state
        setMessages((prev) => [...prev, messageWithSender]);

        // Update conversation timestamp
        await supabase
          .from("chat_conversations")
          .update({ updated_at: new Date().toISOString() })
          .eq("id", conversationId);

        return messageWithSender;
      } catch (error) {
        console.error("Error sending message:", error);
        throw error;
      }
    },
    [user]
  );

  // Mark messages as read
  const markMessagesAsRead = useCallback(
    async (conversationId) => {
      if (!user || !conversationId) return;

      try {
        // Get unread messages in this conversation
        const { data: unreadMessages, error: fetchError } = await supabase
          .from("chat_messages")
          .select("id")
          .eq("conversation_id", conversationId)
          .neq("sender_id", user.id);

        if (fetchError) throw fetchError;

        if (unreadMessages && unreadMessages.length > 0) {
          // Mark each message as read
          const readStatusData = unreadMessages.map((msg) => ({
            message_id: msg.id,
            user_id: user.id,
          }));

          const { error: insertError } = await supabase
            .from("message_read_status")
            .upsert(readStatusData, { onConflict: "message_id,user_id" });

          if (insertError) throw insertError;
        }
      } catch (error) {
        console.error("Error marking messages as read:", error);
      }
    },
    [user]
  );

  // Get or create conversation for an assessment
  const getOrCreateConversation = useCallback(
    async (assessmentId) => {
      if (!user || !assessmentId) return null;

      try {
        // Check if conversation already exists
        const { data: existingConversation, error: fetchError } = await supabase
          .from("chat_conversations")
          .select("*")
          .eq("assessment_id", assessmentId)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError;
        }

        if (existingConversation) {
          return existingConversation;
        }

        // Get assessment details to find customer and assessor, and verify it's approved
        const { data: assessment, error: assessmentError } = await supabase
          .from("assessment_requests")
          .select("user_id, assigned_assessor_id, status")
          .eq("id", assessmentId)
          .single();

        if (assessmentError) throw assessmentError;

        // Only create conversation if assessment is approved
        if (assessment.status !== "approved") {
          console.log("Assessment is not approved, cannot create conversation");
          return null;
        }

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("chat_conversations")
          .insert({
            assessment_id: assessmentId,
            customer_id: assessment.user_id,
            assessor_id: assessment.assigned_assessor_id,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Refresh conversations list
        await fetchConversations();

        return newConversation;
      } catch (error) {
        console.error("Error getting or creating conversation:", error);
        return null;
      }
    },
    [user, profile, fetchConversations]
  );

  // Get unread message count
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc("get_unread_message_count", {
        user_uuid: user.id,
      });

      if (error) throw error;
      setUnreadCount(data || 0);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [user]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    // Subscribe to new messages
    const messagesSubscription = supabase
      .channel("chat_messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${activeConversation?.id || "null"}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
          fetchUnreadCount();
        }
      )
      .subscribe();

    // Subscribe to conversation updates
    const conversationsSubscription = supabase
      .channel("chat_conversations")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "chat_conversations",
        },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    // Subscribe to assessment status changes
    const assessmentsSubscription = supabase
      .channel("assessment_requests")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "assessment_requests",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("Assessment status changed:", payload);
          // Refresh conversations when assessment status changes
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
      supabase.removeChannel(assessmentsSubscription);
    };
  }, [user, activeConversation, fetchConversations, fetchUnreadCount]);

  // Initial data fetch
  useEffect(() => {
    console.log("ChatContext - Initial data fetch triggered, user:", user);
    fetchConversations();
    fetchUnreadCount();
  }, [fetchConversations, fetchUnreadCount]);

  const value = {
    conversations,
    activeConversation,
    messages,
    loading,
    unreadCount,
    setActiveConversation,
    fetchMessages,
    sendMessage,
    markMessagesAsRead,
    getOrCreateConversation,
    fetchConversations,
    fetchUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
