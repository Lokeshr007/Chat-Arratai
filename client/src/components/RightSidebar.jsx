import React, { useContext, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Image, 
  Info, 
  User, 
  UserPlus, 
  UserX, 
  Shield, 
  Mail, 
  Phone, 
  Calendar,
  Mic,
  Video,
  MapPin,
  Link,
  Download,
  FileText,
  Star,
  Pin,
  Volume2,
  VolumeX,
  Bell,
  BellOff,
  Search,
  Shield as ShieldIcon,
  Users,
  Settings,
  Trash2,
  MessageCircle,
  Camera,
  Music,
  File,
  AlertTriangle,
  CheckCircle,
  Crown,
  MoreVertical,
  Edit3,
  ExternalLink,
  Play,
  Pause
} from "lucide-react";
import { FiUsers, FiSettings, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import assets from "../assets/assets";
import { ChatContext } from "../../context/ChatContext";
import { AuthContext } from "../../context/AuthContext";

// Modern gradient colors with glass morphism
const MODERN_COLORS = {
  primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  warning: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  error: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  dark: 'linear-gradient(135deg, #0f0f1a 0%, #1c1c2e 100%)',
  glass: 'rgba(255, 255, 255, 0.08)',
  glassDark: 'rgba(15, 15, 26, 0.85)',
};

const GlassCard = ({ children, className = '', onClick }) => (
  <motion.div 
    className={`bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 ${className}`}
    whileHover={{ y: -2, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
  >
    {children}
  </motion.div>
);

const AnimatedIconButton = ({ children, onClick, className = '', ...props }) => (
  <motion.button
    className={`p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-gray-300 hover:text-white transition-all duration-300 hover:bg-white/10 hover:border-white/20 ${className}`}
    onClick={onClick}
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    {...props}
  >
    {children}
  </motion.button>
);

const StatCard = ({ value, label, icon: Icon, color = "purple" }) => (
  <GlassCard className="p-4 text-center">
    <div className={`w-12 h-12 mx-auto mb-2 rounded-2xl bg-${color}-500/20 backdrop-blur-sm border border-${color}-500/30 flex items-center justify-center`}>
      <Icon className={`w-6 h-6 text-${color}-400`} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </GlassCard>
);

const MediaGrid = ({ media, onMediaClick }) => (
  <div className="grid grid-cols-3 gap-2">
    {media.map((item, index) => (
      <motion.div
        key={index}
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onMediaClick(item)}
      >
        <img
          src={item.url || item}
          alt={`Media ${index + 1}`}
          className="w-full h-24 object-cover rounded-xl border border-white/10 group-hover:border-white/30 transition-all duration-300"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 rounded-xl flex items-center justify-center">
          {item.type === 'video' && (
            <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          )}
        </div>
      </motion.div>
    ))}
  </div>
);

const RightSidebar = ({ onClose, isMobile = false }) => {
  const { 
    selectedUser, 
    selectedGroup,
    blockUser, 
    unblockUser, 
    blockedUsers = [], 
    messages, 
    addMemberToGroup, 
    removeMemberFromGroup,
    users,
    leaveGroup,
    updateGroupInfo,
    muteChat,
    unmuteChat,
    pinnedMessages,
    clearChat,
    downloadFile,
    getFileType,
    getFileIcon,
    chatMedia,
    sharedLinks,
    sharedDocs,
    sharedLocations
  } = useContext(ChatContext);
  const { authUser, onlineUsers } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState("info");
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMemberSearch, setNewMemberSearch] = useState("");
  const [showRemoveMember, setShowRemoveMember] = useState(null);
  const [editGroupInfo, setEditGroupInfo] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [isMuted, setIsMuted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [playingAudio, setPlayingAudio] = useState(null);
  const [mediaFilter, setMediaFilter] = useState("all");

  const currentChat = selectedUser || selectedGroup;
  const audioRef = useRef(null);

  // Enhanced particle background
  const ParticleBackground = () => {
    const particles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20"
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.x}%`,
              top: `${particle.y}%`,
            }}
            animate={{
              y: [0, -20, 0],
              x: [0, 8, 0],
              opacity: [0, 0.6, 0],
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

  if (!currentChat) {
    return (
      <div className="bg-gradient-to-br from-purple-900/50 via-slate-900/50 to-slate-900/50 h-full w-full border-l border-white/10 flex flex-col backdrop-blur-3xl relative">
        <ParticleBackground />
        <div className="flex items-center justify-center h-full text-gray-400 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10 flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-white/60" />
            </div>
            <p className="text-white/60 text-lg font-medium">Select a chat</p>
            <p className="text-white/40 text-sm mt-2">Start a conversation to see details here</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const isGroup = !!selectedGroup;
  const isBlocked = Array.isArray(blockedUsers) && blockedUsers.includes(currentChat._id);
  const isAdmin = isGroup && currentChat.admin?.toString() === authUser?._id?.toString();
  const isMember = isGroup && currentChat.members?.some(member => member._id === authUser?._id);

  // Enhanced media extraction with filtering
  const enhancedChatMedia = chatMedia?.map(media => ({
    url: media,
    type: getFileType(media),
    name: media.split('/').pop()
  })) || [];

  const filteredMedia = enhancedChatMedia.filter(media => {
    if (mediaFilter === "all") return true;
    if (mediaFilter === "images") return media.type === 'image';
    if (mediaFilter === "videos") return media.type === 'video';
    if (mediaFilter === "audio") return media.type === 'audio';
    return true;
  }).filter(media => 
    media.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    media.type?.includes(searchTerm.toLowerCase())
  );

  // Initialize group info
  useEffect(() => {
    if (currentChat && isGroup) {
      setGroupName(currentChat.name || "");
      setGroupDescription(currentChat.description || "");
    }
  }, [currentChat, isGroup]);

  const handleAddMember = async (userId) => {
    try {
      await addMemberToGroup(currentChat._id, [userId]);
      setShowAddMember(false);
      setNewMemberSearch("");
      toast.success("Member added successfully");
    } catch (error) {
      console.error("Add member error:", error);
      toast.error("Failed to add member");
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMemberFromGroup(currentChat._id, userId);
      setShowRemoveMember(null);
      toast.success("Member removed successfully");
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error("Failed to remove member");
    }
  };

  const handleLeaveGroup = async () => {
    if (window.confirm("Are you sure you want to leave this group?")) {
      try {
        await leaveGroup(currentChat._id);
        onClose();
        toast.success("You have left the group");
      } catch (error) {
        console.error("Leave group error:", error);
        toast.error("Failed to leave group");
      }
    }
  };

  const handleUpdateGroupInfo = async () => {
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }

    try {
      await updateGroupInfo(currentChat._id, {
        name: groupName.trim(),
        description: groupDescription.trim()
      });
      setEditGroupInfo(false);
      toast.success("Group info updated successfully");
    } catch (error) {
      console.error("Update group info error:", error);
      toast.error("Failed to update group info");
    }
  };

  const handleMuteToggle = async () => {
    try {
      if (isMuted) {
        await unmuteChat(currentChat._id);
        setIsMuted(false);
        toast.success("Chat unmuted");
      } else {
        await muteChat(currentChat._id);
        setIsMuted(true);
        toast.success("Chat muted");
      }
    } catch (error) {
      console.error("Mute toggle error:", error);
      toast.error("Failed to update mute settings");
    }
  };

  const handleClearChat = async () => {
    if (window.confirm("Are you sure you want to clear this chat? This action cannot be undone.")) {
      try {
        await clearChat(currentChat._id);
        toast.success("Chat cleared successfully");
      } catch (error) {
        console.error("Clear chat error:", error);
        toast.error("Failed to clear chat");
      }
    }
  };

  const handlePlayAudio = (audioUrl) => {
    if (playingAudio === audioUrl) {
      if (audioRef.current) {
        audioRef.current.pause();
        setPlayingAudio(null);
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.play();
      setPlayingAudio(audioUrl);
      
      audio.onended = () => {
        setPlayingAudio(null);
        audioRef.current = null;
      };
    }
  };

  const getJoinDate = () => {
    return currentChat.createdAt ? new Date(currentChat.createdAt).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long',
      day: 'numeric'
    }) : "Unknown";
  };

  const getMediaCount = () => {
    return enhancedChatMedia.length;
  };

  const getMessageCount = () => {
    const chatMessages = messages.filter(msg => 
      msg.receiverId === currentChat._id || msg.senderId === currentChat._id
    );
    return chatMessages.length;
  };

  const filteredUsers = users?.filter(user => 
    user._id !== authUser?._id && 
    !currentChat.members?.some(member => member._id === user._id) &&
    user.fullName?.toLowerCase().includes(newMemberSearch.toLowerCase())
  ) || [];

  const tabItems = [
    { id: "info", label: "Info", icon: Info },
    { id: "media", label: "Media", icon: Image, count: getMediaCount() },
    { id: "links", label: "Links", icon: Link, count: sharedLinks?.length || 0 },
    { id: "docs", label: "Docs", icon: FileText, count: sharedDocs?.length || 0 },
    ...(sharedLocations?.length > 0 ? [{ id: "locations", label: "Locations", icon: MapPin, count: sharedLocations.length }] : []),
    ...(isGroup ? [{ id: "members", label: "Members", icon: Users, count: currentChat.members?.length || 0 }] : [])
  ];

  const mediaFilters = [
    { id: "all", label: "All", icon: Image },
    { id: "images", label: "Images", icon: Camera },
    { id: "videos", label: "Videos", icon: Video },
    { id: "audio", label: "Audio", icon: Music },
  ];

  return (
    <div className="bg-gradient-to-br from-purple-900/50 via-slate-900/50 to-slate-900/50 h-full w-full border-l border-white/10 flex flex-col backdrop-blur-3xl relative overflow-hidden">
      <ParticleBackground />
      
      {/* Enhanced Header */}
      <GlassCard className="rounded-none border-l-0 border-r-0 border-t-0 rounded-b-2xl flex-shrink-0 relative z-10">
        <div className="flex justify-between items-center p-6">
          <motion.div 
            className="flex items-center gap-3 flex-1 min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <motion.div className="relative">
              <motion.img
                src={currentChat.profilePic || currentChat.image || assets.avatar_icon}
                alt="Profile"
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/20"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
              {!isGroup && onlineUsers.includes(currentChat._id) && (
                <motion.div 
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-900"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                />
              )}
            </motion.div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-white truncate">
                {isGroup ? currentChat.name : currentChat.fullName || "User Profile"}
              </h2>
              <p className="text-gray-400 text-sm truncate">
                {isGroup ? (
                  <span className="flex items-center gap-1">
                    <Users size={12} />
                    {currentChat.members?.length || 0} members
                  </span>
                ) : (
                  onlineUsers.includes(currentChat._id) ? (
                    <span className="text-green-400">Online</span>
                  ) : (
                    <span className="text-gray-500">Offline</span>
                  )
                )}
              </p>
            </div>
          </motion.div>
          
          <div className="flex items-center gap-2">
            <AnimatedIconButton onClick={handleMuteToggle} title={isMuted ? "Unmute chat" : "Mute chat"}>
              {isMuted ? <BellOff size={18} /> : <Bell size={18} />}
            </AnimatedIconButton>
            <AnimatedIconButton onClick={onClose}>
              <X size={20} />
            </AnimatedIconButton>
          </div>
        </div>
      </GlassCard>

      {/* Enhanced Tabs */}
      <div className="flex border-b border-white/10 overflow-x-auto flex-shrink-0 px-4 relative z-10">
        {tabItems.map((tab) => {
          const IconComponent = tab.icon;
          return (
            <motion.button
              key={tab.id}
              className={`flex items-center gap-2 flex-1 py-4 px-3 text-sm font-medium transition-all duration-300 min-w-max relative ${
                activeTab === tab.id 
                  ? "text-white border-b-2 border-purple-400" 
                  : "text-gray-400 hover:text-white"
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
            >
              <IconComponent size={16} />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 text-white text-xs rounded-full flex items-center justify-center">
                  {tab.count > 99 ? '99+' : tab.count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Enhanced Content Area */}
      <div className="flex-1 overflow-y-auto p-4 relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {/* Info Tab */}
            {activeTab === "info" && (
              <div className="space-y-6">
                {/* Enhanced Profile Header */}
                <GlassCard className="p-6 text-center">
                  <motion.div className="relative inline-block">
                    <motion.img
                      src={currentChat.profilePic || currentChat.image || assets.avatar_icon}
                      alt="Profile"
                      className="w-24 h-24 rounded-3xl object-cover border-4 border-purple-500/30 mx-auto mb-4"
                      whileHover={{ scale: 1.05 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    />
                    {!isGroup && onlineUsers.includes(currentChat._id) && (
                      <motion.div 
                        className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 rounded-full border-4 border-slate-900"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                      />
                    )}
                  </motion.div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {isGroup ? currentChat.name : currentChat.fullName}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">
                    {isGroup ? (
                      <span className="flex items-center justify-center gap-2">
                        <Users size={14} />
                        {currentChat.members?.length || 0} members • {currentChat.members?.filter(m => onlineUsers.includes(m._id)).length || 0} online
                      </span>
                    ) : (
                      `@${currentChat.username || 'user'}`
                    )}
                  </p>
                  {!isGroup && onlineUsers.includes(currentChat._id) && (
                    <motion.span 
                      className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs border border-green-500/30"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      Online
                    </motion.span>
                  )}
                </GlassCard>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <StatCard 
                    value={getMessageCount()} 
                    label="Messages" 
                    icon={MessageCircle} 
                    color="blue"
                  />
                  <StatCard 
                    value={getMediaCount()} 
                    label="Media" 
                    icon={Image} 
                    color="purple"
                  />
                </div>

                {/* Bio */}
                <GlassCard className="p-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                    <Info size={16} />
                    {isGroup ? "Group Description" : "Bio"}
                  </h4>
                  <p className="text-white text-sm leading-relaxed">
                    {currentChat.bio || currentChat.description || (isGroup ? "No group description" : "No bio available")}
                  </p>
                </GlassCard>

                {/* Group Management */}
                {isGroup && (
                  <GlassCard className="p-4">
                    <div className="space-y-3">
                      {isAdmin && (
                        <motion.button
                          onClick={() => setEditGroupInfo(true)}
                          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Edit3 size={16} />
                          Edit Group Info
                        </motion.button>
                      )}

                      {isMember && (
                        <motion.button
                          onClick={handleLeaveGroup}
                          className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <UserX size={16} />
                          Leave Group
                        </motion.button>
                      )}
                    </div>
                  </GlassCard>
                )}

                {/* User Actions */}
                {!isGroup && (
                  <GlassCard className="p-4">
                    <div className="space-y-3">
                      {isBlocked ? (
                        <motion.button
                          onClick={() => unblockUser(currentChat._id)}
                          className="w-full bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <CheckCircle size={16} />
                          Unblock User
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => blockUser(currentChat._id)}
                          className="w-full bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-center gap-2"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <AlertTriangle size={16} />
                          Block User
                        </motion.button>
                      )}
                    </div>
                  </GlassCard>
                )}

                {/* Additional Info */}
                <GlassCard className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm">
                      <Mail size={16} className="text-gray-400" />
                      <span className="text-gray-300">{currentChat.email || "Not available"}</span>
                    </div>
                    {!isGroup && currentChat.phone && (
                      <div className="flex items-center gap-3 text-sm">
                        <Phone size={16} className="text-gray-400" />
                        <span className="text-gray-300">{currentChat.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-300">Joined {getJoinDate()}</span>
                    </div>
                  </div>
                </GlassCard>

                {/* Danger Zone */}
                <GlassCard className="p-4 border border-red-500/20">
                  <h4 className="text-sm font-medium text-red-400 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} />
                    Danger Zone
                  </h4>
                  <motion.button
                    onClick={handleClearChat}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 font-medium border border-red-500/20"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Trash2 size={16} />
                    Clear Chat History
                  </motion.button>
                </GlassCard>
              </div>
            )}

            {/* Media Tab */}
            {activeTab === "media" && (
              <div className="space-y-4">
                {/* Media Filters */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {mediaFilters.map(filter => (
                    <motion.button
                      key={filter.id}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                        mediaFilter === filter.id
                          ? "bg-purple-500 text-white"
                          : "bg-white/5 text-gray-400 hover:text-white"
                      }`}
                      onClick={() => setMediaFilter(filter.id)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <filter.icon size={14} />
                      {filter.label}
                    </motion.button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search media..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                {/* Media Grid */}
                {filteredMedia.length > 0 ? (
                  <MediaGrid 
                    media={filteredMedia} 
                    onMediaClick={setSelectedMedia}
                  />
                ) : (
                  <GlassCard className="text-center py-12">
                    <Image size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No media found</p>
                    <p className="text-gray-500 text-xs mt-1">Try changing your search or filter</p>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Links Tab */}
            {activeTab === "links" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">
                  Shared Links ({sharedLinks?.length || 0})
                </h4>
                {sharedLinks?.length > 0 ? (
                  <div className="space-y-3">
                    {sharedLinks.map((linkObj, index) => (
                      <GlassCard 
                        key={index} 
                        className="p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
                        whileHover={{ y: -2 }}
                        onClick={() => window.open(linkObj.link, '_blank')}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                            <Link size={16} className="text-purple-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <a 
                              href={linkObj.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-purple-400 hover:text-purple-300 text-sm break-all block mb-2 font-medium group-hover:underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {linkObj.link}
                            </a>
                            <div className="flex justify-between items-center text-xs text-gray-500">
                              <span>Shared by {linkObj.sender}</span>
                              <span>{new Date(linkObj.timestamp).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <ExternalLink size={16} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="text-center py-12">
                    <Link size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No links shared yet</p>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Documents Tab */}
            {activeTab === "docs" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">
                  Shared Documents ({sharedDocs?.length || 0})
                </h4>
                {sharedDocs?.length > 0 ? (
                  <div className="space-y-3">
                    {sharedDocs.map((doc, index) => (
                      <GlassCard 
                        key={index} 
                        className="flex items-center justify-between p-4 hover:bg-white/10 transition-all duration-300 group"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-purple-500/30">
                            <span className="text-lg">{getFileIcon(doc.name)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">
                              {doc.name}
                            </p>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>Shared by {doc.sender}</span>
                              <span>{new Date(doc.timestamp).toLocaleDateString()}</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-1 capitalize">{doc.type}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {doc.type === 'audio' && (
                            <AnimatedIconButton 
                              onClick={() => handlePlayAudio(doc.url)}
                              title={playingAudio === doc.url ? "Pause" : "Play"}
                            >
                              {playingAudio === doc.url ? <Pause size={16} /> : <Play size={16} />}
                            </AnimatedIconButton>
                          )}
                          <AnimatedIconButton 
                            onClick={() => downloadFile(doc.url, doc.name)}
                            title="Download"
                          >
                            <Download size={16} />
                          </AnimatedIconButton>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                ) : (
                  <GlassCard className="text-center py-12">
                    <FileText size={48} className="text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">No documents shared yet</p>
                  </GlassCard>
                )}
              </div>
            )}

            {/* Locations Tab */}
            {activeTab === "locations" && (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-300">
                  Shared Locations ({sharedLocations?.length || 0})
                </h4>
                <div className="space-y-3">
                  {sharedLocations?.map((locationObj, index) => (
                    <GlassCard 
                      key={index} 
                      className="p-4 hover:bg-white/10 transition-all duration-300 group"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-red-500/30">
                          <MapPin size={16} className="text-red-400" />
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            Shared Location
                          </p>
                          <p className="text-gray-400 text-xs">
                            {locationObj.location.address || `Lat: ${locationObj.location.lat}, Lng: ${locationObj.location.lng}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-400 mb-3">
                        <span>Shared by {locationObj.sender}</span>
                        <span>{new Date(locationObj.timestamp).toLocaleString()}</span>
                      </div>
                      <a 
                        href={`https://maps.google.com/?q=${locationObj.location.lat},${locationObj.location.lng}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 text-sm inline-flex items-center gap-2 font-medium group-hover:underline"
                      >
                        <MapPin size={14} />
                        View on Google Maps
                        <ExternalLink size={12} />
                      </a>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === "members" && isGroup && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-sm font-medium text-gray-300">
                    Members ({currentChat.members?.length || 0})
                  </h4>
                  {isAdmin && (
                    <AnimatedIconButton
                      onClick={() => setShowAddMember(true)}
                      className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm"
                    >
                      <UserPlus size={16} />
                      Add Member
                    </AnimatedIconButton>
                  )}
                </div>

                <div className="space-y-2">
                  {currentChat.members?.map(member => (
                    <GlassCard 
                      key={member._id} 
                      className="flex items-center justify-between p-3 hover:bg-white/10 transition-all duration-300 group"
                      whileHover={{ y: -2 }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="relative">
                          <img 
                            src={member.profilePic || assets.avatar_icon} 
                            alt={member.fullName} 
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0 border border-white/10" 
                          />
                          {onlineUsers.includes(member._id) && (
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium truncate">
                              {member.fullName}
                            </p>
                            {member._id === currentChat.admin && (
                              <Crown size={14} className="text-yellow-400 flex-shrink-0" title="Group Admin" />
                            )}
                          </div>
                          <p className="text-gray-400 text-xs truncate">
                            {onlineUsers.includes(member._id) ? (
                              <span className="text-green-400">Online</span>
                            ) : (
                              <span className="text-gray-500">Offline</span>
                            )}
                          </p>
                        </div>
                      </div>

                      {isAdmin && member._id !== authUser?._id && (
                        <AnimatedIconButton 
                          onClick={() => setShowRemoveMember(member._id)}
                          title="Remove member"
                          className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <UserX size={16} />
                        </AnimatedIconButton>
                      )}
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Enhanced Modals */}
      <AnimatePresence>
        {/* Media Preview Modal */}
        {selectedMedia && (
          <motion.div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'image' ? (
                <img
                  src={selectedMedia.url}
                  alt="Preview"
                  className="max-w-full max-h-full rounded-2xl object-contain"
                />
              ) : selectedMedia.type === 'video' ? (
                <video
                  src={selectedMedia.url}
                  controls
                  className="max-w-full max-h-full rounded-2xl"
                  autoPlay
                />
              ) : (
                <div className="bg-slate-800 rounded-2xl p-8 text-center">
                  <FileText size={64} className="text-gray-400 mx-auto mb-4" />
                  <p className="text-white text-lg mb-2">{selectedMedia.name}</p>
                  <p className="text-gray-400">This file type cannot be previewed</p>
                </div>
              )}
              
              <AnimatedIconButton
                onClick={() => setSelectedMedia(null)}
                className="absolute -top-4 -right-4 bg-red-500 hover:bg-red-600 text-white"
              >
                <X size={20} />
              </AnimatedIconButton>
              
              <AnimatedIconButton
                onClick={() => downloadFile(selectedMedia.url, selectedMedia.name)}
                className="absolute -top-4 -right-16 bg-purple-500 hover:bg-purple-600 text-white"
                title="Download"
              >
                <Download size={20} />
              </AnimatedIconButton>
            </motion.div>
          </motion.div>
        )}

        {/* Add Member Modal */}
        {showAddMember && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full border border-white/10 backdrop-blur-3xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              <GlassCard className="rounded-t-2xl rounded-b-none border-b border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white">Add Member to Group</h3>
                  <p className="text-gray-400 text-sm mt-1">Select users to add to the group</p>
                </div>
              </GlassCard>
              
              <div className="p-6 flex-1 overflow-hidden">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={newMemberSearch}
                    onChange={(e) => setNewMemberSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredUsers.map(user => (
                    <motion.div 
                      key={user._id} 
                      onClick={() => handleAddMember(user._id)}
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-white/10 transition-all duration-300 group"
                      whileHover={{ x: 4 }}
                    >
                      <div className="relative">
                        <img 
                          src={user.profilePic || assets.avatar_icon} 
                          alt={user.fullName} 
                          className="w-10 h-10 rounded-xl object-cover border border-white/10" 
                        />
                        {onlineUsers.includes(user._id) && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{user.fullName}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                      <UserPlus size={16} className="text-gray-400 group-hover:text-purple-400 transition-colors" />
                    </motion.div>
                  ))}
                  
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-8">
                      <UserX size={48} className="text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">
                        {newMemberSearch ? "No users found" : "No users available to add"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
              
              <GlassCard className="rounded-b-2xl rounded-t-none border-t border-white/10">
                <div className="p-6 flex gap-3">
                  <motion.button 
                    onClick={() => {
                      setShowAddMember(false);
                      setNewMemberSearch("");
                    }} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 font-medium border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Remove Member Modal */}
        {showRemoveMember && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-sm w-full border border-white/10 backdrop-blur-3xl shadow-2xl"
            >
              <GlassCard className="rounded-t-2xl rounded-b-none border-b border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white">Remove Member</h3>
                </div>
              </GlassCard>
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertTriangle size={24} className="text-yellow-400" />
                  <p className="text-gray-300 text-sm">
                    Are you sure you want to remove this member from the group?
                  </p>
                </div>
              </div>
              
              <GlassCard className="rounded-b-2xl rounded-t-none border-t border-white/10">
                <div className="p-6 flex gap-3">
                  <motion.button 
                    onClick={() => setShowRemoveMember(null)} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 font-medium border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={() => handleRemoveMember(showRemoveMember)} 
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Remove
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Group Info Modal */}
        {editGroupInfo && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full border border-white/10 backdrop-blur-3xl shadow-2xl"
            >
              <GlassCard className="rounded-t-2xl rounded-b-none border-b border-white/10">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white">Edit Group Info</h3>
                  <p className="text-gray-400 text-sm mt-1">Update your group information</p>
                </div>
              </GlassCard>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50"
                    placeholder="Enter group name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={groupDescription}
                    onChange={(e) => setGroupDescription(e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 resize-none"
                    placeholder="Enter group description"
                    rows={4}
                  />
                </div>
              </div>
              
              <GlassCard className="rounded-b-2xl rounded-t-none border-t border-white/10">
                <div className="p-6 flex gap-3">
                  <motion.button 
                    onClick={() => setEditGroupInfo(false)} 
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 font-medium border border-white/10"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button 
                    onClick={handleUpdateGroupInfo} 
                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white rounded-xl transition-all duration-300 font-medium"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden audio element for audio playback */}
      <audio ref={audioRef} className="hidden" />
    </div>
  );
};

export default RightSidebar;