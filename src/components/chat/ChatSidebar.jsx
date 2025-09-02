import { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import { useAuth } from "../../hooks/useAuth";

function ChatSidebar({ isOpen, onClose, onSelectConversation }) {
  const { conversations, loading, unreadCount, setActiveConversation } =
    useChat();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const getConversationTitle = (conversation) => {
    const assessment = conversation.assessment_requests;
    if (assessment) {
      return `${assessment.vehicle_year} ${assessment.vehicle_make} ${assessment.vehicle_model}`;
    }
    return "Assessment Chat";
  };

  const getOtherParticipant = (conversation) => {
    if (user.id === conversation.customer_id) {
      return conversation.assessor;
    } else {
      return conversation.customer;
    }
  };

  const filteredConversations = conversations.filter((conversation) => {
    const title = getConversationTitle(conversation);
    const participant = getOtherParticipant(conversation);
    const searchLower = searchTerm.toLowerCase();

    return (
      title.toLowerCase().includes(searchLower) ||
      participant?.full_name?.toLowerCase().includes(searchLower) ||
      participant?.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleConversationSelect = (conversation) => {
    setActiveConversation(conversation);
    onSelectConversation(conversation);
    if (window.innerWidth < 768) {
      onClose();
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } md:relative md:translate-x-0 md:shadow-none`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-[#333333ff]">Messages</h2>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-red-200 text-red-700 rounded-full">
              {unreadCount}
            </span>
          )}
          <button
            onClick={onClose}
            className="md:hidden p-1 text-gray-400 hover:text-gray-600"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-10 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-sm text-[#333333ff]">No conversations yet.</p>
            <p className="text-xs text-gray-600 mt-1">
              Start a conversation about your assessment.
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredConversations.map((conversation) => {
              const participant = getOtherParticipant(conversation);
              const title = getConversationTitle(conversation);

              return (
                <button
                  key={conversation.id}
                  onClick={() => handleConversationSelect(conversation)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-red-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-red-700">
                        {participant?.full_name?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-[#333333ff] truncate">
                          {title}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0">
                          {formatDate(conversation.updated_at)}
                        </span>
                      </div>
                      <p className="text-xs text-[#333333ff] truncate">
                        {participant?.full_name || "Unknown User"}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {participant?.email || "No email"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatSidebar;
