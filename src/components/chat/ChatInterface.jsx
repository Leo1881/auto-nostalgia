import { useState, useEffect } from "react";
import { useChat } from "../../contexts/ChatContext.jsx";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";

function ChatInterface() {
  const { activeConversation, fetchMessages } = useChat();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation.id);
    }
  }, [activeConversation, fetchMessages]);

  const handleSelectConversation = (conversation) => {
    // The chat context will handle setting the active conversation
  };

  const handleBack = () => {
    setSidebarOpen(true);
  };

  return (
    <div className="flex h-full bg-white">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="w-80 flex-shrink-0 md:block">
        <ChatSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        <ChatWindow conversation={activeConversation} onBack={handleBack} />
      </div>

      {/* Mobile toggle button */}
      {!activeConversation && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed bottom-4 right-4 md:hidden w-12 h-12 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
        >
          <svg
            className="w-6 h-6"
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
        </button>
      )}
    </div>
  );
}

export default ChatInterface;
