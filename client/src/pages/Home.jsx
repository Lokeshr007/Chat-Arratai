import React, { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../components/Sidebar";
import ChatContainer from "../components/ChatContainer";
import RightSidebar from "../components/RightSidebar";
import { ChatContext } from "../../context/ChatContext";

const Home = () => {
  const { selectedUser, selectedGroup, setSelectedUser } = useContext(ChatContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const mainContentRef = useRef(null);

  const isChatActive = selectedUser || selectedGroup;

  // Enhanced animated background with particles
  const ParticleBackground = () => {
    const particles = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Aurora Background */}
        <div className="absolute inset-0">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{
              opacity: [0.3, 0.6, 0.3],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 2
            }}
          />
          <motion.div 
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        </div>
        
        {/* Animated Particles */}
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
              y: [0, -20, 0],
              x: [0, 10, 0],
              opacity: [0, 1, 0],
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

  // Enhanced glassmorphism containers
  const GlassCard = ({ children, className = '' }) => (
    <div className={`bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 ${className}`}>
      {children}
    </div>
  );

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

  // Enhanced new message notification with animations
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isChatActive && Math.random() > 0.7) {
        setHasNewMessage(true);
        setNotificationVisible(true);
      }
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isChatActive]);

  useEffect(() => {
    if (hasNewMessage) {
      const timer = setTimeout(() => {
        setNotificationVisible(false);
        setTimeout(() => setHasNewMessage(false), 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [hasNewMessage]);

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

  // Animation variants
  const sidebarVariants = {
    open: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    closed: { 
      x: "-100%", 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const chatVariants = {
    enter: { 
      x: isMobile ? "100%" : 0, 
      opacity: 0 
    },
    center: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    },
    exit: { 
      x: isMobile ? "-100%" : 0, 
      opacity: 0,
      transition: { 
        type: "spring", 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const featureCards = [
    {
      id: 1,
      title: "Personal Chats",
      icon: (
        <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 005 10a6 6 0 0112 0c0 .-.1.15-.286.331l-.002.003c-.277.27-.602.567-.945.861a5 5 0 00-4.767-2.195z" clipRule="evenodd" />
        </svg>
      ),
      color: "from-purple-500/20 to-purple-600/20",
      glow: "shadow-purple-500/50"
    },
    {
      id: 2,
      title: "Group Chats",
      icon: (
        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      color: "from-blue-500/20 to-blue-600/20",
      glow: "shadow-blue-500/50"
    },
    {
      id: 3,
      title: "Media Sharing",
      icon: (
        <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      color: "from-green-500/20 to-green-600/20",
      glow: "shadow-green-500/50"
    },
    {
      id: 4,
      title: "Fast & Secure",
      icon: (
        <svg className="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      color: "from-orange-500/20 to-orange-600/20",
      glow: "shadow-orange-500/50"
    }
  ];

  // Enhanced message animation component
  const AnimatedMessageIllustration = () => (
    <div className="relative w-48 h-48">
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 rounded-3xl"
        whileHover={{ 
          scale: 1.05,
          rotateX: 5,
          rotateY: -5
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {/* Animated message exchange */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-16 h-8 bg-purple-500/40 rounded-2xl rounded-bl-none"
            animate={{
              y: [0, -10, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
          <motion.div
            className="w-12 h-8 bg-blue-500/40 rounded-2xl rounded-br-none ml-8 -mt-4"
            animate={{
              y: [0, 10, 0],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1
            }}
          />
        </div>
        
        {/* Floating elements */}
        <motion.div
          className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400/40 rounded-full backdrop-blur-sm border border-yellow-400/50"
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
        <motion.div
          className="absolute -bottom-2 -left-2 w-3 h-3 bg-green-400/40 rounded-full backdrop-blur-sm border border-green-400/50"
          animate={{
            scale: [1, 1.8, 1],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            delay: 1
          }}
        />
      </motion.div>
    </div>
  );

  return (
    <div className="w-full h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-slate-900 flex overflow-hidden relative">
      <ParticleBackground />

      {/* Floating Action Button for Mobile */}
      {isMobile && !isChatActive && !isProfileOpen && (
        <motion.button
          onClick={toggleSidebar}
          className="md:hidden fixed bottom-6 right-6 z-50 bg-gradient-to-r from-purple-600 to-blue-500 text-white p-4 rounded-full shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </motion.button>
      )}

      {/* Sidebar with Enhanced Animations */}
      <AnimatePresence mode="wait">
        {(!isMobile || !isChatActive) && (
          <motion.div
            initial={isMobile ? "closed" : false}
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className={`
              h-full flex-shrink-0 bg-white/5 backdrop-blur-3xl border-r border-white/10
              transition-all duration-500 ease-out relative z-30
              ${isMobile 
                ? (isChatActive || isProfileOpen ? '-translate-x-full' : 'translate-x-0 w-full') 
                : sidebarCollapsed ? 'w-20' : 'w-80 lg:w-96'
              }
              ${sidebarCollapsed && !isMobile ? 'hover:w-80' : ''}
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Collapse Toggle Button for Desktop */}
      {!isMobile && (
        <motion.button
          onClick={toggleSidebar}
          className="fixed top-4 z-40 bg-white/10 backdrop-blur-md text-white/80 p-2 rounded-lg border border-white/20 hover:bg-white/20 hover:text-white transition-all duration-300 hidden md:block"
          style={{ left: sidebarCollapsed ? '5rem' : '19rem' }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
        >
          <motion.svg 
            className="w-4 h-4" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            animate={{ rotate: sidebarCollapsed ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </motion.svg>
        </motion.button>
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
        <AnimatePresence mode="wait">
          {/* Chat Container */}
          <motion.div
            key={isChatActive ? "chat-active" : "chat-inactive"}
            initial="enter"
            animate="center"
            exit="exit"
            variants={chatVariants}
            className={`
              h-full transition-all duration-500 bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-3xl
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
              // Premium Desktop Placeholder with Enhanced Animations
              !isMobile && (
                <motion.div 
                  className="flex flex-col items-center justify-center h-full text-white/80 text-center p-8 relative z-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <AnimatedMessageIllustration />

                  <motion.h3 
                    className="text-3xl font-bold mb-4 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    Welcome to Connect
                  </motion.h3>
                  <motion.p 
                    className="text-white/60 mb-8 max-w-md text-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    Start a conversation and stay connected with your friends and colleagues
                  </motion.p>
                  
                  {/* Enhanced Feature Cards with Staggered Animation */}
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    {featureCards.map((feature, index) => (
                      <motion.div
                        key={feature.id}
                        className={`
                          bg-gradient-to-br ${feature.color} backdrop-blur-sm rounded-2xl p-4 border border-white/10 
                          transition-all duration-300 group cursor-pointer relative overflow-hidden
                          ${hoveredFeature === feature.id ? `shadow-lg ${feature.glow} transform -translate-y-1` : ''}
                        `}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        whileHover={{ 
                          scale: 1.05,
                          y: -2
                        }}
                        onHoverStart={() => setHoveredFeature(feature.id)}
                        onHoverEnd={() => setHoveredFeature(null)}
                      >
                        <div className="relative z-10">
                          <motion.div 
                            className={`w-10 h-10 bg-gradient-to-br ${feature.color.replace('/20', '/30')} rounded-xl mb-3 flex items-center justify-center`}
                            whileHover={{ scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400 }}
                          >
                            {feature.icon}
                          </motion.div>
                          <p className="text-sm font-medium">{feature.title}</p>
                        </div>
                        
                        {/* Hover glow effect */}
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10`} />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )
            )}
          </motion.div>
        </AnimatePresence>

        {/* Right Sidebar (Profile) */}
        <AnimatePresence>
          {isProfileOpen && (
            <motion.div
              initial={{ x: isMobile ? '100%' : 0, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: isMobile ? '100%' : 0, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`
                h-full bg-white/5 backdrop-blur-3xl border-l border-white/10
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Mobile placeholder */}
        {isMobile && !isChatActive && !isProfileOpen && (
          <motion.div 
            className="w-full flex flex-col items-center justify-center h-full text-white/80 text-center p-8 relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <motion.div 
                className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center"
                animate={{ 
                  scale: [1, 1.05, 1],
                  rotate: [0, 2, 0, -2, 0]
                }}
                transition={{ 
                  duration: 4,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              >
                <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </motion.div>
              <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                Your Messages
              </h3>
              <p className="text-white/60 text-sm">
                Select a conversation to start chatting
              </p>
            </div>
            
            {/* Animated typing indicator */}
            <motion.div className="absolute bottom-32 flex space-x-1">
              {[0, 1, 2].map((dot) => (
                <motion.div
                  key={dot}
                  className="w-2 h-2 bg-purple-400 rounded-full"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: dot * 0.2
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Enhanced Mobile back button */}
      {isMobile && (isChatActive || isProfileOpen) && (
        <motion.button
          onClick={handleMobileBack}
          className="md:hidden fixed top-6 left-6 z-50 bg-white/10 backdrop-blur-md text-white p-3 rounded-xl shadow-2xl border border-white/20 hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
      )}

      {/* Enhanced Mobile overlay */}
      {isMobile && isProfileOpen && (
        <motion.div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="button"
          tabIndex={0}
          onClick={() => setIsProfileOpen(false)}
          onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') setIsProfileOpen(false); }}
          aria-label="Close profile overlay"
        />
      )}

      {/* Enhanced New Message Notification */}
      <AnimatePresence>
        {notificationVisible && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.8 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-3 rounded-2xl shadow-2xl shadow-green-500/30"
          >
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-3 h-3 bg-white rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm font-medium">New message received</span>
              <motion.button
                onClick={() => setNotificationVisible(false)}
                className="text-white/80 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;