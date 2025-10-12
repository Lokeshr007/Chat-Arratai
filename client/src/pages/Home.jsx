import React, { useContext, useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const Home = () => {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const isChatActive = selectedUser || selectedGroup;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close profile sidebar when selected user changes on mobile
  useEffect(() => {
    if (isMobile && isProfileOpen) {
      setIsProfileOpen(false);
    }
  }, [selectedUser, selectedGroup, isMobile, isProfileOpen]);

  // Handle back button for mobile
  const handleMobileBack = () => {
    if (isProfileOpen) {
      setIsProfileOpen(false);
    } else {
      // Use context to clear selection instead of history back
      window.location.reload(); // Temporary fix - better to implement proper state management
    }
  };

  // Function to open profile sidebar
  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  return (
    <div className="w-full h-screen bg-[#0f0f1a] flex">
      
      {/* Sidebar - Fixed width, always visible on desktop */}
      <div 
        className={`
          h-full flex-shrink-0 border-r border-gray-700 bg-[#1c1c2e]
          transition-all duration-300 ease-in-out
          ${isMobile ? (isChatActive ? 'hidden' : 'w-full') : 'w-80 lg:w-96'}
        `}
      >
        <Sidebar 
          isMobile={isMobile} 
          onUserSelect={() => {}} 
          selectedUser={selectedUser}
          onOpenProfile={handleOpenProfile}
        />
      </div>

      {/* Main Chat Area - Takes remaining space */}
      <div 
        className={`
          flex-1 h-full relative overflow-hidden bg-[#14142b]
          transition-all duration-300 ease-in-out
          ${isMobile && !isChatActive ? 'hidden' : 'flex'}
        `}
      >
        {/* ChatContainer - Full width when RightSidebar is closed, half when open on desktop */}
        {isChatActive && (
          <div className={`h-full transition-all duration-300 ${
            isProfileOpen && !isMobile ? 'w-1/2' : 'w-full'
          }`}>
            <ChatContainer onOpenProfile={handleOpenProfile} />
          </div>
        )}

        {/* RightSidebar (Profile) - Full width on mobile, half on desktop */}
        {isProfileOpen && (
          <div className={`
            h-full bg-[#1c1c2e] border-l border-gray-700 transition-all duration-300
            ${isMobile ? 'w-full absolute inset-0 z-40' : 'w-1/2'}
          `}>
            <RightSidebar onClose={() => setIsProfileOpen(false)} />
          </div>
        )}

        {/* Desktop Placeholder - Centered when no chat is selected */}
        {!isChatActive && !isMobile && (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-center p-8">
            <div className="max-w-md">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-[#282142] flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-light mb-2 text-white">Welcome to ChatApp</h3>
              <p className="text-sm text-gray-500 mb-4">
                Select a conversation from the sidebar to start messaging.
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>💬 Send text messages, images, and files</p>
                <p>🎤 Record and send voice messages</p>
                <p>👥 Create group chats with multiple users</p>
                <p>⚡ Real-time typing indicators</p>
                <p>📱 Fully responsive design</p>
              </div>
            </div>
          </div>
        )}

        {/* Mobile placeholder */}
        {isMobile && !isChatActive && (
          <div className="md:hidden flex items-center justify-center h-full text-gray-400 text-center p-8">
            <div>
              <p className="text-lg font-light mb-2 text-white">No chat selected</p>
              <p className="text-sm text-gray-500">
                Choose a conversation from the sidebar to start chatting
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile back button when chat is active or profile is open */}
      {(isMobile && (isChatActive || isProfileOpen)) && (
        <button
          onClick={handleMobileBack}
          className="md:hidden fixed top-4 left-4 z-50 bg-[#282142] text-white p-2 rounded-lg shadow-lg border border-gray-600 hover:bg-[#333366] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Mobile overlay when profile is open */}
      {isMobile && isProfileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;