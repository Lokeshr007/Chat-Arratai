import React, { useContext, useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import ChatContainer from '../components/ChatContainer';
import RightSidebar from '../components/RightSidebar';
import { ChatContext } from '../../context/ChatContext';

const Home = () => {
  const { selectedUser, selectedGroup, setSelectedUser } = useContext(ChatContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const mainContentRef = useRef(null);

  const isChatActive = selectedUser || selectedGroup;

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setSidebarCollapsed(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close profile sidebar when selected user changes on mobile
  useEffect(() => {
    if (isMobile && isProfileOpen) {
      setIsProfileOpen(false);
    }
  }, [selectedUser, selectedGroup, isMobile, isProfileOpen]);

  // Simulate new message notification
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChatActive && Math.random() > 0.7) {
        setHasNewMessage(true);
        setTimeout(() => setHasNewMessage(false), 2000);
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, [isChatActive]);

  const handleMobileBack = () => {
    if (isProfileOpen) {
      setIsProfileOpen(false);
    } else {
      setSelectedUser(null);
    }
  };

  const handleOpenProfile = () => {
    setIsProfileOpen(true);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Action Button for Mobile */}
      {isMobile && !isChatActive && !isProfileOpen && (
        <button
          onClick={toggleSidebar}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 active:scale-95"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Sidebar */}
      <div 
        className={`
          h-full flex-shrink-0 bg-white/5 backdrop-blur-2xl border-r border-white/10
          transition-all duration-500 ease-out
          ${isMobile 
            ? (isChatActive || isProfileOpen ? '-translate-x-full' : 'translate-x-0 w-full') 
            : sidebarCollapsed ? 'w-20' : 'w-80 lg:w-96'
          }
          ${sidebarCollapsed && !isMobile ? 'hover:w-80' : ''}
          relative z-30
        `}
      >
        <Sidebar 
          isMobile={isMobile} 
          onUserSelect={() => {}} 
          selectedUser={selectedUser}
          setIsProfileOpen={setIsProfileOpen}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
      </div>

      {/* Collapse Toggle Button for Desktop */}
      {!isMobile && (
        <button
          onClick={toggleSidebar}
          className="fixed top-4 left-4 z-40 bg-white/10 backdrop-blur-md text-white/80 p-2 rounded-lg border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-300 hover:scale-105 hidden md:block"
          style={{ left: sidebarCollapsed ? '5rem' : '19rem' }}
        >
          <svg 
            className={`w-4 h-4 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Main Content Area */}
      <div 
        ref={mainContentRef}
        className={`
          flex-1 h-full relative overflow-hidden
          transition-all duration-500 ease-out
          ${isMobile && !isChatActive && !isProfileOpen ? 'hidden' : 'flex'}
        `}
      >
        {/* Chat Container */}
        <div 
          className={`
            h-full transition-all duration-500 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl
            ${isProfileOpen 
              ? (isMobile ? 'hidden' : 'w-2/3 lg:w-3/4') 
              : 'w-full'
            }
            relative
          `}
        >
          {isChatActive ? (
            <ChatContainer 
              onOpenProfile={handleOpenProfile} 
              onBack={handleMobileBack}
              isProfileOpen={isProfileOpen}
            />
          ) : (
            // Enhanced Desktop Placeholder
            !isMobile && (
              <div className="flex flex-col items-center justify-center h-full text-white/80 text-center p-8 relative z-10">
                {/* Animated Illustration */}
                <div className="relative mb-8">
                  <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center relative overflow-hidden">
                    {/* Animated dots */}
                    <div className="absolute top-8 left-8 w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                    <div className="absolute top-8 right-8 w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-8 left-8 w-3 h-3 bg-indigo-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
                    <div className="absolute bottom-8 right-8 w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
                    
                    {/* Message bubbles */}
                    <div className="flex flex-col space-y-3 transform rotate-12">
                      <div className="w-20 h-6 bg-white/20 rounded-full backdrop-blur-sm"></div>
                      <div className="w-16 h-6 bg-purple-500/40 rounded-full backdrop-blur-sm ml-4"></div>
                      <div className="w-24 h-6 bg-white/20 rounded-full backdrop-blur-sm"></div>
                    </div>
                  </div>
                  
                  {/* Floating elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-yellow-400/20 rounded-full backdrop-blur-sm border border-yellow-400/30 animate-bounce"></div>
                  <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-green-400/20 rounded-full backdrop-blur-sm border border-green-400/30 animate-bounce" style={{animationDelay: '0.3s'}}></div>
                </div>

                <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                  Welcome to Connect
                </h3>
                <p className="text-white/60 mb-8 max-w-md text-lg">
                  Start a conversation and stay connected with your friends and colleagues
                </p>
                
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0c0 .-.1.15-.286.331l-.002.003c-.277.27-.602.567-.945.861a5 5 0 00-4.767-2.195z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Personal Chats</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Group Chats</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-green-500/20 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Media Sharing</p>
                  </div>
                  
                  <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                    <div className="w-10 h-10 bg-orange-500/20 rounded-xl mb-3 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium">Fast & Secure</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* Right Sidebar (Profile) */}
        {isProfileOpen && (
          <div 
            className={`
              h-full bg-white/5 backdrop-blur-2xl border-l border-white/10 transition-all duration-500
              ${isMobile 
                ? 'w-full absolute inset-0 z-40' 
                : 'w-1/3 lg:w-1/4 flex-shrink-0'
              }
            `}
          >
            <RightSidebar 
              onClose={() => setIsProfileOpen(false)} 
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Enhanced Mobile placeholder */}
        {isMobile && !isChatActive && !isProfileOpen && (
          <div className="w-full flex flex-col items-center justify-center h-full text-white/80 text-center p-8 relative">
            <div className="mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Your Messages
              </h3>
              <p className="text-white/60 text-sm">
                Select a conversation to start chatting
              </p>
            </div>
            
            {/* Animated typing indicator for demo */}
            <div className="absolute bottom-32 flex space-x-1">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Mobile back button */}
      {isMobile && (isChatActive || isProfileOpen) && (
        <button
          onClick={handleMobileBack}
          className="md:hidden fixed top-6 left-6 z-50 bg-white/10 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      {/* Enhanced Mobile overlay */}
      {isMobile && isProfileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          role="button"
          tabIndex={0}
          onClick={() => setIsProfileOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setIsProfileOpen(false); }}
          aria-label="Close profile overlay"
        />
      )}

      {/* New Message Notification */}
      {hasNewMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-full shadow-2xl animate-pulse">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            <span className="text-sm font-medium">New message received</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;