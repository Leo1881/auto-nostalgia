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
    if (!user) return;

    try {
      setLoading(true);

      // First, get the conversations
      const { data: conversations, error: conversationsError } = await supabase
        .from("chat_conversations")
        .select("*")
        .or(`customer_id.eq.${user.id},assessor_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (conversationsError) throw conversationsError;

      // Then, get the related data for each conversation
      const conversationsWithData = await Promise.all(
        conversations.map(async (conversation) => {
          // Get assessment request data
          const { data: assessmentData } = await supabase
            .from("assessment_requests")
            .select("id, vehicle_make, vehicle_model, vehicle_year")
            .eq("id", conversation.assessment_id)
            .single();

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
            assessment_requests: assessmentData,
            customer: customerData,
            assessor: assessorData,
          };
        })
      );

      setConversations(conversationsWithData || []);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

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

        return data;
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

        // Get assessment details to find customer and assessor
        const { data: assessment, error: assessmentError } = await supabase
          .from("assessment_requests")
          .select("customer_id, assigned_assessor_id")
          .eq("id", assessmentId)
          .single();

        if (assessmentError) throw assessmentError;

        // Create new conversation
        const { data: newConversation, error: createError } = await supabase
          .from("chat_conversations")
          .insert({
            assessment_id: assessmentId,
            customer_id: assessment.customer_id,
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
    [user, fetchConversations]
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

    return () => {
      supabase.removeChannel(messagesSubscription);
      supabase.removeChannel(conversationsSubscription);
    };
  }, [user, activeConversation, fetchConversations, fetchUnreadCount]);

  // Initial data fetch
  useEffect(() => {
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
