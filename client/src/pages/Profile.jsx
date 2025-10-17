import React, { useState, useContext, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import toast from "react-hot-toast";
import { 
  FiArrowLeft, 
  FiUser, 
  FiLock, 
  FiShield, 
  FiCamera, 
  FiCheck, 
  FiMail, 
  FiGlobe,
  FiEye,
  FiEyeOff,
  FiUsers,
  FiMessageSquare,
  FiBell,
  FiLogOut,
  FiTrash2,
  FiSave,
  FiEdit3,
  FiAward,
  FiCalendar,
  FiStar,
  FiSettings,
  FiHeart,
  FiShare2,
  FiDownload,
  FiUpload,
  FiX,
  FiPlus,
  FiMinus,
  FiChevronDown,
  FiChevronUp,
  FiChevronRight,
  FiSearch,
  FiVideo,
  FiPhone,
  FiMapPin,
  FiLink,
  FiBookmark,
  FiArchive,
  FiClock,
  FiHelpCircle,
  FiShield as FiSecurity,
  FiDatabase,
  FiWifi,
  FiWifiOff,
  FiMoon,
  FiSun,
  FiVolume2,
  FiVolumeX,
  FiMic,
  FiMicOff,
  FiUserPlus,
  FiUserMinus,
  FiUserCheck,
  FiUserX,
  FiFlag,
  FiAlertTriangle,
  FiCheckCircle,
  FiZap,
  FiCloud,
  FiHardDrive,
  FiRefreshCw,
  FiBarChart2,  // Changed from FiBarChart3
  FiActivity,
  FiCpu,
  FiBattery,
  FiWifi as FiSignal
} from 'react-icons/fi';

// If you need the other icons, import them from appropriate packages:
import { 
  FiKey, 
  FiSmartphone,
  FiTablet
} from 'react-icons/fi';

// For icons not available in Feather, use other icon sets:
import { 
  MdQrCode,           // from react-icons/md
  MdLanguage,         // from react-icons/md  
  MdPalette,          // from react-icons/md
  MdMessage,          // from react-icons/md (alternative to MessageCircle)
  MdLaptop            // from react-icons/md
} from 'react-icons/md';

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

const GlassCard = ({ children, className = '', onClick, hover = true }) => (
  <motion.div 
    className={`bg-white/5 backdrop-blur-3xl border border-white/10 rounded-2xl shadow-2xl shadow-purple-500/10 ${className}`}
    whileHover={hover ? { scale: onClick ? 1.02 : 1, y: -2 } : {}}
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

const ToggleSwitch = ({ enabled, onChange, size = "md" }) => (
  <button
    type="button"
    className={`${
      enabled ? 'bg-green-500' : 'bg-gray-600'
    } relative inline-flex flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
      size === "sm" ? 'h-5 w-9' : 'h-6 w-11'
    }`}
    onClick={() => onChange(!enabled)}
  >
    <span
      className={`${
        enabled ? (size === "sm" ? 'translate-x-4' : 'translate-x-5') : 'translate-x-0'
      } pointer-events-none inline-block transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
        size === "sm" ? 'h-3 w-3' : 'h-4 w-4'
      }`}
    />
  </button>
);

const Profile = ({ onClose, isMobile }) => {
  const { authUser, updateProfile, changePassword, logout, deleteAccount, updateSettings } = useContext(AuthContext);
  const { getUsers, userStats, clearChatHistory, blockUser, unblockUser } = useContext(ChatContext);
  const navigate = useNavigate();
  
  // State management
  const [activeTab, setActiveTab] = useState("edit");
  const [selectedImg, setSelectedImg] = useState(null);
  const [name, setName] = useState(authUser?.fullName || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [username, setUsername] = useState(authUser?.username || '');
  const [status, setStatus] = useState(authUser?.status || 'Hey there! I am using ChatApp');
  const [phone, setPhone] = useState(authUser?.phone || '');
  const [location, setLocation] = useState(authUser?.location || '');
  const [website, setWebsite] = useState(authUser?.website || '');
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTwoFASetup, setShowTwoFASetup] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  
  // Enhanced privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    // Profile visibility
    profileVisibility: 'everyone',
    lastSeen: 'everyone',
    profilePhoto: 'everyone',
    about: 'everyone',
    status: 'everyone',
    groups: 'everyone',
    
    // Messaging
    readReceipts: true,
    showTypingIndicator: true,
    allowMessageForwarding: true,
    showReadTime: true,
    
    // Calls
    allowCallsFrom: 'everyone',
    showCallerID: true,
    ringtone: 'default',
    vibration: true,
    
    // Groups
    allowGroupInvites: 'everyone',
    addToGroups: 'everyone',
    groupAdminsOnly: false,
    
    // Stories
    allowStories: true,
    storyVisibility: 'contacts',
    storyReplies: 'everyone',
    saveToGallery: true,
  });

  // Enhanced theme settings
  const [themeSettings, setThemeSettings] = useState({
    // Appearance
    theme: 'system',
    darkMode: true,
    accentColor: 'purple',
    wallpaper: 'default',
    
    // Chat
    messageBubbles: 'modern',
    fontSize: 'medium',
    chatBackground: 'gradient',
    backgroundImage: null,
    
    // Accessibility
    reduceAnimations: false,
    highContrast: false,
    boldText: false,
    largerText: false,
    
    // Advanced
    autoNightMode: true,
    useSystemTheme: true,
    syncAcrossDevices: true,
  });

  // Enhanced notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    // General
    messageNotifications: true,
    groupNotifications: true,
    callNotifications: true,
    storyNotifications: true,
    
    // Sounds
    messageSounds: true,
    groupSounds: true,
    callRingtone: true,
    vibration: true,
    popupNotifications: true,
    
    // Privacy
    showPreview: true,
    showSenderName: true,
    showMessageContent: true,
    
    // Do Not Disturb
    doNotDisturb: false,
    dndSchedule: false,
    dndStartTime: '22:00',
    dndEndTime: '08:00',
    dndExceptions: [],
    
    // Advanced
    priorityContacts: true,
    repeatAlerts: false,
    ledColor: 'blue',
    inAppSounds: true,
  });

  // Security settings
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    appLock: false,
    appLockTimeout: 'immediately',
    appLockType: 'pin',
    biometricAuth: false,
    showSecurityNotifications: true,
    encryptedBackup: true,
    autoLock: true,
    loginAlerts: true,
    suspiciousActivityAlerts: true,
  });

  // Storage settings
  const [storageSettings, setStorageSettings] = useState({
    autoDownload: {
      photos: 'wifi',
      videos: 'wifi',
      documents: 'wifi',
      audio: 'wifi',
    },
    mediaQuality: 'auto',
    saveToCameraRoll: true,
    resetMediaDownloads: false,
    networkUsage: 'auto',
    storageUsage: {
      total: 5120, // 5GB
      used: 1247,
      photos: 856,
      videos: 234,
      documents: 89,
      other: 68,
    },
  });

  // Account settings
  const [accountSettings, setAccountSettings] = useState({
    // Privacy
    deleteAccountAfter: 'never',
    syncContacts: true,
    syncFrequency: 'daily',
    
    // Advanced
    language: 'english',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    temperatureUnit: 'celsius',
    distanceUnit: 'kilometers',
    
    // Data
    autoBackup: true,
    backupFrequency: 'weekly',
    backupNetwork: 'wifi',
    includeVideos: true,
    lastBackup: '2024-01-15',
  });

  // Blocked contacts
  const [blockedContacts, setBlockedContacts] = useState([
    { id: 1, name: 'Spam User', phone: '+1234567890', avatar: null, blockedDate: '2024-01-10' },
    { id: 2, name: 'Unknown', phone: '+0987654321', avatar: null, blockedDate: '2024-01-08' },
  ]);

  // Linked devices
  const [linkedDevices, setLinkedDevices] = useState([
    { id: 1, name: 'iPhone 14 Pro', type: 'mobile', lastActive: '2 hours ago', active: true },
    { id: 2, name: 'MacBook Pro', type: 'desktop', lastActive: '1 day ago', active: false },
    { id: 3, name: 'iPad Air', type: 'tablet', lastActive: '3 days ago', active: false },
  ]);

  // Refs
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const wallpaperInputRef = useRef(null);

  // Enhanced particle background
  const ParticleBackground = () => {
    const particles = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 3
    }));

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0">
          <motion.div 
            className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.1, 1] }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />
          <motion.div 
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"
            animate={{ opacity: [0.3, 0.7, 0.3], scale: [1, 1.2, 1] }}
            transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: 2 }}
          />
        </div>
        
        {particles.map(particle => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-white/5"
            style={{ width: `${particle.size}px`, height: `${particle.size}px`, left: `${particle.x}%`, top: `${particle.y}%` }}
            animate={{ y: [0, -20, 0], x: [0, 8, 0], opacity: [0, 0.8, 0] }}
            transition={{ duration: particle.duration, repeat: Infinity, delay: particle.delay }}
          />
        ))}
      </div>
    );
  };

  // Tab configuration
  const tabItems = [
    { id: "edit", label: "Edit Profile", icon: FiUser, color: "from-purple-500 to-pink-500" },
    { id: "privacy", label: "Privacy", icon: FiShield, color: "from-green-500 to-emerald-500" },
    { id: "security", label: "Security", icon: FiSecurity, color: "from-red-500 to-orange-500" },
    { id: "notifications", label: "Notifications", icon: FiBell, color: "from-yellow-500 to-amber-500" },
    { id: "theme", label: "Theme & Wallpaper", icon: Palette, color: "from-indigo-500 to-purple-500" },
    { id: "storage", label: "Storage & Data", icon: FiDatabase, color: "from-blue-500 to-cyan-500" },
    { id: "account", label: "Account", icon: FiSettings, color: "from-gray-500 to-gray-700" },
    { id: "devices", label: "Linked Devices", icon: Laptop, color: "from-teal-500 to-green-500" },
    { id: "help", label: "Help", icon: FiHelpCircle, color: "from-orange-500 to-red-500" },
  ];

  // Utility functions
  const getInitials = (name) => {
    return name?.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2) || 'U';
  };

  const calculateAccountAge = () => {
    if (!authUser?.createdAt) return 'Unknown';
    const joinDate = new Date(authUser.createdAt);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const calculateStoragePercentage = (used, total) => {
    return (used / total) * 100;
  };

  // Enhanced profile update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      let body = { 
        fullName: name.trim(), 
        bio: bio.trim(),
        username: username.trim() || undefined,
        status: status.trim(),
        phone: phone.trim(),
        location: location.trim(),
        website: website.trim(),
      };

      if (selectedImg) {
        const base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedImg);
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
        });
        body.profilePic = base64Image;
      }

      const data = await updateProfile(body);
      if (data.success) {
        toast.success("Profile updated successfully! 🎉");
        setSelectedImg(null);
        setIsEditing(false);
        await getUsers();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // Enhanced password change
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      toast.error("Password must contain uppercase, lowercase letters and numbers");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    
    if (oldPassword === newPassword) {
      toast.error("New password must be different from old password");
      return;
    }

    setLoading(true);
    try {
      const data = await changePassword({ oldPassword, newPassword });
      if (data.success) {
        toast.success("Password changed successfully! 🔒");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        toast.error(data.message || "Password change failed");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  // Two-factor authentication setup
  const handleTwoFASetup = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSecuritySettings(prev => ({ ...prev, twoFactorAuth: true }));
      setShowTwoFASetup(false);
      toast.success("Two-factor authentication enabled! 🔐");
    } catch (error) {
      toast.error("Failed to enable two-factor authentication");
    } finally {
      setLoading(false);
    }
  };

  // Data export functionality
  const handleExportData = async () => {
    setExportLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const exportData = {
        userInfo: {
          name: authUser?.fullName,
          email: authUser?.email,
          username: authUser?.username,
          bio: authUser?.bio,
          joinDate: authUser?.createdAt
        },
        settings: {
          privacy: privacySettings,
          theme: themeSettings,
          notifications: notificationSettings,
          security: securitySettings,
          storage: storageSettings,
          account: accountSettings
        },
        statistics: userStatistics,
        exportDate: new Date().toISOString()
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `chat-app-data-${new Date().getTime()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success("Data exported successfully! 📥");
    } catch (error) {
      toast.error("Failed to export data");
    } finally {
      setExportLoading(false);
    }
  };

  // Clear all chats
  const handleClearAllChats = async () => {
    setLoading(true);
    try {
      await clearChatHistory();
      toast.success("All chats cleared successfully! 🗑️");
    } catch (error) {
      toast.error("Failed to clear chats");
    } finally {
      setLoading(false);
    }
  };

  // Block contact
  const handleBlockContact = (contactId) => {
    setBlockedContacts(prev => prev.filter(contact => contact.id !== contactId));
    toast.success("Contact unblocked");
  };

  // Unlink device
  const handleUnlinkDevice = (deviceId) => {
    setLinkedDevices(prev => prev.filter(device => device.id !== deviceId));
    toast.success("Device unlinked");
  };

  // Stats data
  const userStatistics = {
    messagesSent: userStats?.messagesSent || 1247,
    groupsJoined: userStats?.groupsJoined || 8,
    friendsCount: userStats?.friendsCount || 42,
    mediaShared: userStats?.mediaShared || 156,
    streakDays: userStats?.streakDays || 15,
    accountAge: calculateAccountAge(),
    storageUsed: formatFileSize(storageSettings.storageUsage.used * 1024 * 1024),
    storageTotal: formatFileSize(storageSettings.storageUsage.total * 1024 * 1024),
    storagePercentage: calculateStoragePercentage(storageSettings.storageUsage.used, storageSettings.storageUsage.total).toFixed(1)
  };

  // Status options
  const statusOptions = [
    'Hey there! I am using ChatApp',
    'Available',
    'Busy',
    'At the movies',
    'At work',
    'Battery about to die',
    'Can\'t talk, ChatApp only',
    'In a meeting',
    'At the gym',
    'Sleeping',
    'Urgent calls only'
  ];

  return (
    <div className={`min-h-screen bg-gradient-to-br from-[#0f0f1a] via-[#1c1c2e] to-[#282142] flex items-center justify-center p-4 relative overflow-hidden ${isMobile ? 'w-full' : ''}`}>
      <ParticleBackground />
      
      <motion.div 
        className={`w-full max-w-7xl bg-white/5 backdrop-blur-3xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden ${isMobile ? 'h-screen rounded-none' : ''}`}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        
        {/* Enhanced Header */}
        <GlassCard className="rounded-t-3xl rounded-b-none border-b border-white/10">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {onClose && (
                  <motion.button 
                    onClick={onClose}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-all duration-300 p-3 hover:bg-white/5 rounded-xl backdrop-blur-sm border border-white/10"
                    whileHover={{ scale: 1.05, x: -5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiArrowLeft size={20} />
                    {!isMobile && <span className="font-medium">Back to Chat</span>}
                  </motion.button>
                )}
              </div>
              
              <motion.h1 
                className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Settings
              </motion.h1>
              
              <div className="flex items-center gap-2">
                <AnimatedIconButton onClick={() => setIsEditing(!isEditing)}>
                  <FiEdit3 size={18} />
                </AnimatedIconButton>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className='flex flex-col xl:flex-row min-h-[800px]'>
          {/* Enhanced Left Sidebar */}
          <div className='xl:w-80 bg-white/5 border-r border-white/10 p-6 flex flex-col relative'>
            {/* User Stats Card */}
            <GlassCard className="p-6 mb-6">
              <div className="flex items-center gap-4 mb-4">
                <motion.div 
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {selectedImg ? (
                    <img 
                      src={URL.createObjectURL(selectedImg)} 
                      alt="Preview" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg"
                    />
                  ) : authUser?.profilePic ? (
                    <img 
                      src={authUser.profilePic} 
                      alt="Profile" 
                      className="w-16 h-16 rounded-2xl object-cover border-2 border-purple-500/50 shadow-lg"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg border-2 border-purple-500/50 shadow-lg">
                      {getInitials(authUser?.fullName)}
                    </div>
                  )}
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[#1c1c2e] shadow-lg"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white text-base truncate">{authUser?.fullName}</p>
                  <p className="text-gray-400 text-sm truncate">@{authUser?.username || 'user'}</p>
                  <p className="text-gray-500 text-xs mt-1">{status}</p>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white font-bold text-sm">{userStatistics.messagesSent}</p>
                  <p className="text-gray-400 text-xs">Messages</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white font-bold text-sm">{userStatistics.friendsCount}</p>
                  <p className="text-gray-400 text-xs">Friends</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white font-bold text-sm">{userStatistics.groupsJoined}</p>
                  <p className="text-gray-400 text-xs">Groups</p>
                </div>
                <div className="bg-white/5 rounded-lg p-2">
                  <p className="text-white font-bold text-sm">{userStatistics.streakDays}</p>
                  <p className="text-gray-400 text-xs">Streak</p>
                </div>
              </div>
            </GlassCard>

            {/* Navigation */}
            <div className="space-y-2 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {tabItems.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <motion.button 
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-300 font-medium group ${
                      activeTab === tab.id 
                        ? `bg-gradient-to-r ${tab.color} text-white shadow-lg` 
                        : "text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/10 border border-transparent"
                    }`}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <IconComponent size={20} className="group-hover:scale-110 transition-transform" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <motion.button 
                onClick={handleExportData}
                disabled={exportLoading}
                className="w-full flex items-center justify-center gap-3 text-blue-400 hover:text-blue-300 text-sm py-3 hover:bg-blue-500/10 rounded-xl transition-all duration-300 border border-blue-500/20 hover:border-blue-500/40 font-medium disabled:opacity-50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {exportLoading ? (
                  <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <FiDownload size={16} />
                )}
                {exportLoading ? "Exporting..." : "Export Data"}
              </motion.button>
              
              <motion.button 
                onClick={logout}
                className="w-full flex items-center justify-center gap-3 text-red-400 hover:text-red-300 text-sm py-3 hover:bg-red-500/10 rounded-xl transition-all duration-300 border border-red-500/20 hover:border-red-500/40 font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <FiLogOut size={16} />
                Sign Out
              </motion.button>
            </div>
          </div>

          {/* Enhanced Main Content Area */}
          <div 
            ref={contentRef}
            className='flex-1 p-8 overflow-y-auto max-h-[800px] [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.3)_transparent]'
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto"
              >

                {/* Edit Profile Tab */}
                {activeTab === "edit" && (
                  <form onSubmit={handleSubmit}>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'>
                      <FiUser className="text-purple-400" />
                      Edit Profile
                    </motion.h2>
                    
                    {/* Profile Picture Upload */}
                    <GlassCard className="p-6 mb-6">
                      <label className="block text-lg font-semibold text-white mb-4">Profile Picture</label>
                      <div className="flex items-center gap-6">
                        <motion.div className="relative" whileHover={{ scale: 1.05 }}>
                          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-2xl relative overflow-hidden border-2 border-purple-500/50 shadow-lg">
                            {selectedImg ? (
                              <img src={URL.createObjectURL(selectedImg)} alt="Preview" className="w-full h-full object-cover" />
                            ) : authUser?.profilePic ? (
                              <img src={authUser.profilePic} alt="Profile" className="w-full h-full object-cover" />
                            ) : ( getInitials(authUser?.fullName) )}
                          </div>
                          <motion.label htmlFor='avatar' className="absolute -bottom-2 -right-2 w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-xl flex items-center justify-center cursor-pointer hover:from-purple-700 hover:to-blue-600 transition-all duration-300 border-2 border-[#1c1c2e] shadow-lg" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                            <FiCamera size={16} />
                          </motion.label>
                          <input ref={fileInputRef} onChange={handleImageChange} type='file' id='avatar' accept='.png, .jpg, .jpeg, .webp' hidden />
                        </motion.div>
                        <div className="flex-1">
                          <p className="text-gray-300 text-sm mb-2">Upload a new profile picture</p>
                          <p className="text-gray-500 text-xs">Recommended: Square image, max 5MB • JPG, PNG, WebP</p>
                          <div className="flex gap-2 mt-3">
                            <AnimatedIconButton onClick={() => fileInputRef.current?.click()}>
                              <FiUpload size={14} />
                            </AnimatedIconButton>
                            {selectedImg && (
                              <AnimatedIconButton onClick={() => setSelectedImg(null)}>
                                <FiX size={14} />
                              </AnimatedIconButton>
                            )}
                          </div>
                        </div>
                      </div>
                    </GlassCard>

                    {/* Form Fields */}
                    <div className="space-y-6">
                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Full Name *</label>
                        <input onChange={(e) => setName(e.target.value)} value={name} type='text' required placeholder='Enter your full name' className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm' disabled={loading || !isEditing} />
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Username</label>
                        <input onChange={(e) => setUsername(e.target.value)} value={username} type='text' placeholder='Choose a username' className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm' disabled={loading || !isEditing} />
                        <p className="text-gray-400 text-xs mt-2">This will be your unique identifier across the platform</p>
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Status</label>
                        <select value={status} onChange={(e) => setStatus(e.target.value)} className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm' disabled={loading || !isEditing}>
                          {statusOptions.map(option => <option key={option} value={option}>{option}</option>)}
                        </select>
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Bio</label>
                        <textarea onChange={(e) => setBio(e.target.value)} value={bio} placeholder='Tell us about yourself...' className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm resize-none' rows={4} disabled={loading || !isEditing} maxLength={500}></textarea>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-gray-400 text-xs">Share a brief description about yourself</p>
                          <p className={`text-xs ${bio.length > 450 ? 'text-red-400' : 'text-gray-400'}`}>{bio.length}/500</p>
                        </div>
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Phone Number</label>
                        <input onChange={(e) => setPhone(e.target.value)} value={phone} type='tel' placeholder='+1 (555) 123-4567' className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm' disabled={loading || !isEditing} />
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Location</label>
                        <input onChange={(e) => setLocation(e.target.value)} value={location} type='text' placeholder='Your location' className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm' disabled={loading || !isEditing} />
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Website</label>
                        <input onChange={(e) => setWebsite(e.target.value)} value={website} type='url' placeholder='https://example.com' className='w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50 transition-all duration-300 backdrop-blur-sm' disabled={loading || !isEditing} />
                      </GlassCard>

                      <GlassCard className="p-6">
                        <label className="block text-sm font-semibold text-white mb-3">Email Address</label>
                        <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl text-gray-300">
                          <FiMail size={18} />
                          <span className="font-medium">{authUser?.email}</span>
                        </div>
                        <p className="text-gray-400 text-xs mt-2">Contact support to change your email address</p>
                      </GlassCard>
                    </div>

                    {isEditing && (
                      <motion.button type='submit' disabled={loading} className={`w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 mt-8 shadow-lg ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:from-purple-700 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02]'}`} whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
                        {loading ? ( <div className="flex items-center justify-center gap-3"><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Saving Changes...</div> ) : ( <div className="flex items-center justify-center gap-3"><FiSave size={18} />Save Changes</div> )}
                      </motion.button>
                    )}

                    {!isEditing && (
                      <motion.button onClick={() => setIsEditing(true)} className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-xl font-semibold transition-all duration-300 mt-8 shadow-lg hover:from-purple-700 hover:to-blue-600 hover:shadow-xl hover:scale-[1.02]" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <div className="flex items-center justify-center gap-3"><FiEdit3 size={18} />Enable Editing</div>
                      </motion.button>
                    )}
                  </form>
                )}

                {/* Privacy Tab */}
                {activeTab === "privacy" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><FiShield className="text-green-400" />Privacy Settings</motion.h2>
                    <div className="space-y-6">
                      {/* Last Seen & Online */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3"><FiUsers className="text-purple-400" />Last Seen & Online</h3>
                        <div className="space-y-4">
                          {['lastSeen', 'profilePhoto', 'about', 'status', 'groups'].map((setting) => (
                            <div key={setting} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex-1">
                                <p className="font-medium text-white capitalize">{setting.replace(/([A-Z])/g, ' $1')}</p>
                                <p className="text-sm text-gray-400">Who can see your {setting.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                              </div>
                              <select value={privacySettings[setting]} onChange={(e) => setPrivacySettings(prev => ({...prev, [setting]: e.target.value}))} className="bg-white/5 border border-white/10 rounded-lg text-white text-sm p-2 focus:outline-none focus:border-purple-500/50">
                                <option value="everyone">Everyone</option>
                                <option value="contacts">My Contacts</option>
                                <option value="nobody">Nobody</option>
                              </select>
                            </div>
                          ))}
                        </div>
                      </GlassCard>

                      {/* Groups */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3"><FiUsers className="text-blue-400" />Groups</h3>
                        <div className="space-y-4">
                          {['allowGroupInvites', 'addToGroups'].map((setting) => (
                            <div key={setting} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex-1">
                                <p className="font-medium text-white capitalize">{setting.replace(/([A-Z])/g, ' $1')}</p>
                                <p className="text-sm text-gray-400">Who can {setting.replace(/([A-Z])/g, ' $1').toLowerCase()}</p>
                              </div>
                              <select value={privacySettings[setting]} onChange={(e) => setPrivacySettings(prev => ({...prev, [setting]: e.target.value}))} className="bg-white/5 border border-white/10 rounded-lg text-white text-sm p-2 focus:outline-none focus:border-purple-500/50">
                                <option value="everyone">Everyone</option>
                                <option value="contacts">My Contacts</option>
                                <option value="nobody">Nobody</option>
                              </select>
                            </div>
                          ))}
                          <label className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 cursor-pointer">
                            <div className="flex-1">
                              <p className="font-medium text-white">Group Admins Only</p>
                              <p className="text-sm text-gray-400">Only admins can edit group info</p>
                            </div>
                            <ToggleSwitch enabled={privacySettings.groupAdminsOnly} onChange={(val) => setPrivacySettings(prev => ({...prev, groupAdminsOnly: val}))} />
                          </label>
                        </div>
                      </GlassCard>

                      {/* Blocked Contacts */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-3"><FiUserX className="text-red-400" />Blocked Contacts</h3>
                        <div className="space-y-3">
                          {blockedContacts.map(contact => (
                            <div key={contact.id} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/10">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                                  <FiUserX className="text-red-400" />
                                </div>
                                <div>
                                  <p className="font-medium text-white">{contact.name}</p>
                                  <p className="text-sm text-gray-400">{contact.phone}</p>
                                </div>
                              </div>
                              <AnimatedIconButton onClick={() => handleBlockContact(contact.id)} className="text-red-400 hover:bg-red-500/10">
                                <FiUserCheck size={16} />
                              </AnimatedIconButton>
                            </div>
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === "security" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><FiSecurity className="text-red-400" />Security</motion.h2>
                    <div className="space-y-6">
                      {/* Two-Factor Authentication */}
                      <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Two-Factor Authentication</h3>
                            <p className="text-gray-400 text-sm">Add an extra layer of security to your account</p>
                          </div>
                          <ToggleSwitch enabled={securitySettings.twoFactorAuth} onChange={(val) => val ? setShowTwoFASetup(true) : setSecuritySettings(prev => ({...prev, twoFactorAuth: false}))} />
                        </div>
                        {securitySettings.twoFactorAuth && (
                          <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <div className="flex items-center gap-3 text-green-400">
                              <FiCheckCircle size={20} />
                              <span className="font-medium">Two-factor authentication is enabled</span>
                            </div>
                          </div>
                        )}
                      </GlassCard>

                      {/* App Lock */}
                      <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">App Lock</h3>
                            <p className="text-gray-400 text-sm">Require authentication to open the app</p>
                          </div>
                          <ToggleSwitch enabled={securitySettings.appLock} onChange={(val) => setSecuritySettings(prev => ({...prev, appLock: val}))} />
                        </div>
                        {securitySettings.appLock && (
                          <div className="space-y-4 mt-4">
                            <div className="flex items-center justify-between">
                              <span className="text-white">Lock Timer</span>
                              <select value={securitySettings.appLockTimeout} onChange={(e) => setSecuritySettings(prev => ({...prev, appLockTimeout: e.target.value}))} className="bg-white/5 border border-white/10 rounded-lg text-white text-sm p-2">
                                <option value="immediately">Immediately</option>
                                <option value="1min">After 1 minute</option>
                                <option value="5min">After 5 minutes</option>
                                <option value="1hour">After 1 hour</option>
                              </select>
                            </div>
                            <label className="flex items-center justify-between">
                              <span className="text-white">Use Biometric</span>
                              <ToggleSwitch enabled={securitySettings.biometricAuth} onChange={(val) => setSecuritySettings(prev => ({...prev, biometricAuth: val}))} size="sm" />
                            </label>
                          </div>
                        )}
                      </GlassCard>

                      {/* Security Notifications */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Security Notifications</h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Show Security Notifications</p>
                              <p className="text-sm text-gray-400">Get alerts about security events</p>
                            </div>
                            <ToggleSwitch enabled={securitySettings.showSecurityNotifications} onChange={(val) => setSecuritySettings(prev => ({...prev, showSecurityNotifications: val}))} />
                          </label>
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Login Alerts</p>
                              <p className="text-sm text-gray-400">Get notified of new logins</p>
                            </div>
                            <ToggleSwitch enabled={securitySettings.loginAlerts} onChange={(val) => setSecuritySettings(prev => ({...prev, loginAlerts: val}))} />
                          </label>
                        </div>
                      </GlassCard>

                      {/* Change Password */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                          <div className="relative">
                            <input type={showOldPassword ? 'text' : 'password'} placeholder="Current Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50" />
                            <button type="button" onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-3 top-3 text-gray-400">
                              {showOldPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          <div className="relative">
                            <input type={showNewPassword ? 'text' : 'password'} placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-500/50" />
                            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-3 text-gray-400">
                              {showNewPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                          </div>
                          <motion.button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg font-semibold disabled:opacity-50" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            Change Password
                          </motion.button>
                        </form>
                      </GlassCard>
                    </div>
                  </div>
                )}

                {/* Notifications Tab */}
                {activeTab === "notifications" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><FiBell className="text-yellow-400" />Notifications</motion.h2>
                    <div className="space-y-6">
                      {/* Message Notifications */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Message Notifications</h3>
                        <div className="space-y-4">
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Message Sounds</p>
                              <p className="text-sm text-gray-400">Play sounds for new messages</p>
                            </div>
                            <ToggleSwitch enabled={notificationSettings.messageSounds} onChange={(val) => setNotificationSettings(prev => ({...prev, messageSounds: val}))} />
                          </label>
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Vibration</p>
                              <p className="text-sm text-gray-400">Vibrate for new messages</p>
                            </div>
                            <ToggleSwitch enabled={notificationSettings.vibration} onChange={(val) => setNotificationSettings(prev => ({...prev, vibration: val}))} />
                          </label>
                          <label className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Show Preview</p>
                              <p className="text-sm text-gray-400">Show message content in notifications</p>
                            </div>
                            <ToggleSwitch enabled={notificationSettings.showPreview} onChange={(val) => setNotificationSettings(prev => ({...prev, showPreview: val}))} />
                          </label>
                        </div>
                      </GlassCard>

                      {/* Do Not Disturb */}
                      <GlassCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-white">Do Not Disturb</h3>
                            <p className="text-gray-400 text-sm">Silence notifications during specified hours</p>
                          </div>
                          <ToggleSwitch enabled={notificationSettings.doNotDisturb} onChange={(val) => setNotificationSettings(prev => ({...prev, doNotDisturb: val}))} />
                        </div>
                        {notificationSettings.doNotDisturb && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">Start Time</label>
                              <input type="time" value={notificationSettings.dndStartTime} onChange={(e) => setNotificationSettings(prev => ({...prev, dndStartTime: e.target.value}))} className="w-full p-2 bg-white/5 border border-white/10 rounded text-white text-sm" />
                            </div>
                            <div>
                              <label className="block text-sm text-gray-400 mb-2">End Time</label>
                              <input type="time" value={notificationSettings.dndEndTime} onChange={(e) => setNotificationSettings(prev => ({...prev, dndEndTime: e.target.value}))} className="w-full p-2 bg-white/5 border border-white/10 rounded text-white text-sm" />
                            </div>
                          </div>
                        )}
                      </GlassCard>
                    </div>
                  </div>
                )}

                {/* Theme & Wallpaper Tab */}
                {activeTab === "theme" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><Palette className="text-indigo-400" />Theme & Wallpaper</motion.h2>
                    <div className="space-y-6">
                      {/* Theme Selection */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Theme</h3>
                        <div className="grid grid-cols-3 gap-4">
                          {['Light', 'Dark', 'System'].map(theme => (
                            <motion.button key={theme} onClick={() => setThemeSettings(prev => ({...prev, theme: theme.toLowerCase()}))} className={`p-4 rounded-xl border-2 ${themeSettings.theme === theme.toLowerCase() ? 'border-purple-500 bg-purple-500/20' : 'border-white/10 bg-white/5'} transition-all duration-300`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <div className={`w-8 h-8 rounded-full mx-auto mb-2 ${theme === 'Light' ? 'bg-white' : theme === 'Dark' ? 'bg-gray-800' : 'bg-gradient-to-r from-white to-gray-800'}`} />
                              <span className="text-white text-sm">{theme}</span>
                            </motion.button>
                          ))}
                        </div>
                      </GlassCard>

                      {/* Accent Color */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Accent Color</h3>
                        <div className="grid grid-cols-6 gap-3">
                          {['purple', 'blue', 'green', 'red', 'orange', 'pink'].map(color => (
                            <motion.button key={color} onClick={() => setThemeSettings(prev => ({...prev, accentColor: color}))} className={`w-10 h-10 rounded-full ${themeSettings.accentColor === color ? 'ring-2 ring-white' : ''} bg-${color}-500`} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} />
                          ))}
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                )}

                {/* Storage & Data Tab */}
                {activeTab === "storage" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><FiDatabase className="text-blue-400" />Storage & Data</motion.h2>
                    <div className="space-y-6">
                      {/* Storage Usage */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Storage Usage</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-white">Total Storage</span>
                            <span className="text-gray-400">{userStatistics.storageUsed} / {userStatistics.storageTotal}</span>
                          </div>
                          <div className="w-full bg-gray-600 rounded-full h-2">
                            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${userStatistics.storagePercentage}%` }} />
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-center">
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white font-bold">{storageSettings.storageUsage.photos}</p>
                              <p className="text-gray-400 text-xs">Photos (MB)</p>
                            </div>
                            <div className="p-3 bg-white/5 rounded-lg">
                              <p className="text-white font-bold">{storageSettings.storageUsage.videos}</p>
                              <p className="text-gray-400 text-xs">Videos (MB)</p>
                            </div>
                          </div>
                        </div>
                      </GlassCard>

                      {/* Clear Storage */}
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Clear Storage</h3>
                        <div className="space-y-3">
                          <button onClick={handleClearAllChats} className="w-full text-left p-3 bg-white/5 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-300 text-red-400">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FiTrash2 />
                                <span>Clear All Chats</span>
                              </div>
                              <FiChevronRight />
                            </div>
                          </button>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                )}

                {/* Account Tab */}
                {activeTab === "account" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><FiSettings className="text-gray-400" />Account</motion.h2>
                    <div className="space-y-6">
                      {/* Delete Account */}
                      <GlassCard className="p-6 border border-red-500/20 bg-red-500/10">
                        <h3 className="text-lg font-semibold text-white mb-4 text-red-400">Danger Zone</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-white">Delete Account</p>
                              <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                            </div>
                            <motion.button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all duration-300" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                )}

                {/* Linked Devices Tab */}
                {activeTab === "devices" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><Laptop className="text-teal-400" />Linked Devices</motion.h2>
                    <div className="space-y-4">
                      {linkedDevices.map(device => (
                        <GlassCard key={device.id} className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${device.active ? 'bg-green-500/20' : 'bg-gray-500/20'}`}>
                                {device.type === 'mobile' ? <Smartphone className={device.active ? 'text-green-400' : 'text-gray-400'} /> : 
                                 device.type === 'tablet' ? <Tablet className={device.active ? 'text-green-400' : 'text-gray-400'} /> : 
                                 <Laptop className={device.active ? 'text-green-400' : 'text-gray-400'} />}
                              </div>
                              <div>
                                <p className="font-semibold text-white">{device.name}</p>
                                <p className="text-sm text-gray-400">Last active: {device.lastActive}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {device.active && <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />}
                              <AnimatedIconButton onClick={() => handleUnlinkDevice(device.id)} className="text-red-400 hover:bg-red-500/10">
                                <FiLogOut size={16} />
                              </AnimatedIconButton>
                            </div>
                          </div>
                        </GlassCard>
                      ))}
                    </div>
                  </div>
                )}

                {/* Help Tab */}
                {activeTab === "help" && (
                  <div>
                    <motion.h2 className='text-2xl font-bold text-white mb-8 flex items-center gap-3'><FiHelpCircle className="text-orange-400" />Help & Support</motion.h2>
                    <div className="space-y-6">
                      <GlassCard className="p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Get Help</h3>
                        <div className="space-y-3">
                          <button className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FiHelpCircle className="text-blue-400" />
                                <span>FAQ & Help Center</span>
                              </div>
                              <FiChevronRight />
                            </div>
                          </button>
                          <button className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FiMail className="text-green-400" />
                                <span>Contact Support</span>
                              </div>
                              <FiChevronRight />
                            </div>
                          </button>
                          <button className="w-full text-left p-4 bg-white/5 rounded-xl border border-white/10 hover:border-purple-500/30 transition-all duration-300">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FiAlertTriangle className="text-yellow-400" />
                                <span>Report a Problem</span>
                              </div>
                              <FiChevronRight />
                            </div>
                          </button>
                        </div>
                      </GlassCard>
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Two-Factor Authentication Setup Modal */}
      <AnimatePresence>
        {showTwoFASetup && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full border border-white/10 backdrop-blur-3xl shadow-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                  <FiShield className="text-green-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Enable Two-Factor Authentication</h3>
                <p className="text-gray-300 mb-6">Scan the QR code with your authenticator app and enter the code below:</p>
                <div className="bg-white p-4 rounded-lg mb-4 inline-block">
                  {/* QR Code placeholder */}
                  <div className="w-48 h-48 bg-gray-200 flex items-center justify-center text-gray-500">
                    QR Code Placeholder
                  </div>
                </div>
                <input type="text" placeholder="Enter 6-digit code" value={twoFACode} onChange={(e) => setTwoFACode(e.target.value)} className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-xl tracking-widest mb-4" maxLength={6} />
                <div className="flex gap-3">
                  <button onClick={() => setShowTwoFASetup(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 font-medium">Cancel</button>
                  <button onClick={handleTwoFASetup} disabled={twoFACode.length !== 6 || loading} className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50">Enable</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl max-w-md w-full border border-white/10 backdrop-blur-3xl shadow-2xl p-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center border border-red-500/30">
                  <FiTrash2 className="text-red-400" size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
                <p className="text-gray-300 mb-6">Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.</p>
                <div className="flex gap-3">
                  <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 border border-white/10 font-medium">Cancel</button>
                  <button onClick={handleDeleteAccount} disabled={loading} className="flex-1 py-3 bg-gradient-to-r from-red-600 to-pink-500 hover:from-red-700 hover:to-pink-600 text-white rounded-xl transition-all duration-300 font-medium disabled:opacity-50">{loading ? 'Deleting...' : 'Delete Account'}</button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;