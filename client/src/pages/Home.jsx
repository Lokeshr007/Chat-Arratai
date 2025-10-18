import React, { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import Profile from "./Profile";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

const Home = () => {
  const { selectedUser, selectedGroup } = useContext(ChatContext);
  const { authUser } = useContext(AuthContext);
  
  // State management
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeView, setActiveView] = useState("chats"); // "chats", "profile", "rightSidebar"
  const [showWelcome, setShowWelcome] = useState(true);

  const isChatActive = selectedUser || selectedGroup;
  const touchStartRef = useRef(null);

  // Custom scrollbar styles
  const scrollbarStyles = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.2);
      border-radius: 10px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.3);
    }
    .no-scrollbar::-webkit-scrollbar {
      display: none;
    }
    .no-scrollbar {
      -ms-overflow-style: none;
      scrollbar-width: none;
    }
  `;

  // Add scrollbar styles to head
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = scrollbarStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Particle Background Component
  const ParticleBackground = () => {
    const particles = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>
        
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/10"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 10, 0],
              opacity: [0, 0.8, 0],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              delay: particle.delay,
            }}
          />
        ))}
      </div>
    );
  };

  // Window resize handler
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

  // Touch gesture handlers for mobile swipe
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
      if (!touchStartRef.current || !isMobile) return;

      const touchEnd = e.changedTouches[0].clientX;
      const diff = touchStartRef.current - touchEnd;

      // Swipe right to open sidebar (only when in chats view)
      if (diff < -50 && activeView === "chats" && !isChatActive) {
        setSidebarCollapsed(false);
      }
      
      // Swipe left to go back from profile/rightsidebar to chats
      if (diff > 50 && (activeView === "profile" || activeView === "rightSidebar")) {
        setActiveView("chats");
      }

      touchStartRef.current = null;
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, activeView, isChatActive]);

  // Reset to chats view when chat becomes active
  useEffect(() => {
    if (isChatActive && activeView !== "chats") {
      setActiveView("chats");
    }
  }, [isChatActive, activeView]);

  // Auto-hide welcome message after delay
  useEffect(() => {
    if (showWelcome && !isChatActive && activeView === "chats") {
      const timer = setTimeout(() => {
        setShowWelcome(false);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [showWelcome, isChatActive, activeView]);

  // Handler functions
  const handleOpenProfileFromSidebar = () => {
    setActiveView("profile");
  };

  const handleOpenProfileFromChat = () => {
    if (isMobile) {
      setActiveView("rightSidebar");
    } else {
      setActiveView("rightSidebar");
    }
  };

  const handleCloseProfile = () => {
    setActiveView("chats");
  };

  const handleBackToChats = () => {
    setActiveView("chats");
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const handleStartChatting = () => {
    setShowWelcome(false);
  };

  // Welcome Message Component
  const WelcomeMessage = () => (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-white text-center p-8 relative z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      <motion.div
        className="mb-12"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <motion.div
          className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {authUser?.profilePic ? (
            <img 
              src={authUser.profilePic} 
              alt="Profile" 
              className="w-full h-full object-cover rounded-3xl"
            />
          ) : (
            <div className="text-3xl">
              {authUser?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase() || '👋'}
            </div>
          )}
        </motion.div>
        
        <motion.h3 
          className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Welcome to Connect
        </motion.h3>
        <motion.p 
          className="text-white/60 text-sm"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          Start meaningful conversations with your connections
        </motion.p>
      </motion.div>

      <motion.div
        className="relative mb-12"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 100, 
          damping: 15,
          delay: 0.6 
        }}
      >
        <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <div className="text-5xl">💬</div>
        </div>
      </motion.div>

      <motion.button
        onClick={handleStartChatting}
        className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-2xl shadow-purple-500/30 transition-all duration-300"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        Start Chatting
      </motion.button>
    </motion.div>
  );

  // Minimal Welcome State
  const MinimalWelcome = () => (
    <motion.div 
      className="flex flex-col items-center justify-center h-full text-white text-center p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mb-8"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/20 flex items-center justify-center">
          <div className="text-5xl">💬</div>
        </div>
        <motion.h3 
          className="text-2xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Your Messages
        </motion.h3>
        <motion.p 
          className="text-white/70 text-base"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Select a conversation to start chatting
        </motion.p>
      </motion.div>
    </motion.div>
  );

  // Determine what to render in main content area
  const renderMainContent = () => {
    // Profile View (Full width like ChatContainer)
    if (activeView === "profile") {
      return (
        <div className="w-full h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-3xl custom-scrollbar overflow-hidden">
          <Profile onClose={handleBackToChats} isMobile={isMobile} />
        </div>
      );
    }

    // Right Sidebar View (User profile from chat)
    if (activeView === "rightSidebar") {
      if (isMobile) {
        // On mobile, right sidebar takes full screen
        return (
          <div className="w-full h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-3xl custom-scrollbar overflow-hidden">
            <RightSidebar onClose={handleBackToChats} isMobile={isMobile} />
          </div>
        );
      } else {
        // On desktop, show chat + right sidebar
        return (
          <>
            <div className="flex-1 h-full">
              {isChatActive ? (
                <ChatContainer 
                  onOpenProfile={handleOpenProfileFromChat} 
                  isProfileOpen={activeView === "rightSidebar"}
                />
              ) : (
                <div className="h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-3xl custom-scrollbar overflow-hidden">
                  {showWelcome ? <WelcomeMessage /> : <MinimalWelcome />}
                </div>
              )}
            </div>
            <div className="w-96 h-full border-l border-white/10 custom-scrollbar overflow-hidden">
              <RightSidebar onClose={handleBackToChats} isMobile={isMobile} />
            </div>
          </>
        );
      }
    }

    // Default Chats View
    return (
      <div className="w-full h-full custom-scrollbar overflow-hidden">
        {isChatActive ? (
          <ChatContainer 
            onOpenProfile={handleOpenProfileFromChat} 
            isProfileOpen={activeView === "rightSidebar"}
          />
        ) : (
          <div className="h-full bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-3xl custom-scrollbar overflow-hidden">
            {showWelcome ? <WelcomeMessage /> : <MinimalWelcome />}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden relative">
      <ParticleBackground />

      {/* Floating Action Button for Mobile */}
      {isMobile && activeView === "chats" && !isChatActive && (
        <motion.button
          onClick={toggleSidebar}
          className="md:hidden fixed bottom-8 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring", 
            stiffness: 200, 
            damping: 15,
            delay: 0.5 
          }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {/* Sidebar - Show in chats view and when profile is active on desktop */}
      <AnimatePresence>
        {(activeView === "chats" || (!isMobile && activeView === "profile")) && (
          <motion.div
            className={`
              h-full flex-shrink-0 bg-white/10 backdrop-blur-3xl border-r border-white/20
              transition-all duration-500 ease-out relative z-30 custom-scrollbar overflow-hidden
              ${isMobile 
                ? (activeView !== "chats" ? '-translate-x-full' : 'translate-x-0 w-full') 
                : sidebarCollapsed ? 'w-20' : 'w-80'
              }
            `}
            initial={isMobile ? { x: -400 } : { x: 0 }}
            animate={{ 
              x: isMobile && activeView !== "chats" ? -400 : 0 
            }}
            exit={{ x: -400 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            <Sidebar 
              isMobile={isMobile} 
              selectedUser={selectedUser}
              setIsProfileOpen={handleOpenProfileFromSidebar}
              collapsed={sidebarCollapsed}
              onToggleCollapse={toggleSidebar}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 h-full relative overflow-hidden flex">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            className="flex-1 h-full flex"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderMainContent()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Back Button for Mobile when in profile/rightsidebar views */}
      {isMobile && (activeView === "profile" || activeView === "rightSidebar") && (
        <motion.button
          onClick={handleBackToChats}
          className="md:hidden fixed top-4 left-4 z-50 bg-black/50 text-white p-3 rounded-full backdrop-blur-sm border border-white/20"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      {/* Swipe Hint for Mobile */}
      {isMobile && activeView === "chats" && !isChatActive && (
        <motion.div
          className="md:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2 border border-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <p className="text-white/60 text-xs">Swipe right to open menu</p>
        </motion.div>
      )}
    </div>
  );
};

export default Home;