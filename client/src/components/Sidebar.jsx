import React, { useEffect, useState, useContext, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { ChatContext } from "../../context/ChatContext";
import { 
  FiPlus, 
  FiUsers, 
  FiMessageSquare, 
  FiArrowLeft, 
  FiSettings, 
  FiLogOut, 
  FiSearch,
  FiX,
  FiUserPlus,
  FiUserCheck,
  FiUserX,
  FiBell,
  FiCheck,
  FiCamera,
  FiMail,
  FiUser,
  FiEdit3,
  FiLock,
  FiTrash2,
  FiVideo,
  FiPhone,
  FiMoreVertical,
  FiHeart,
  FiStar,
  FiShield,
  FiClock,
  FiActivity,
  FiAward,
  FiTrendingUp,
  FiCompass,
  FiBookmark,
  FiCalendar,
  FiBarChart2,
  FiZap,
  FiTarget,
  FiEye,
  FiImage,
  FiSave,
  FiKey,
  FiArchive,
  FiLogOut as FiExit,
  FiTrash,
  FiEyeOff,
  FiRefreshCw,
  FiHome,
  FiGrid
} from "react-icons/fi";
import { 
  RiGroupLine, 
  RiUserAddLine, 
  RiCheckboxCircleLine,
  RiCloseCircleLine 
} from "react-icons/ri";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Import the Profile component
import Profile from "../pages/Profile";

const Sidebar = ({ isMobile, onUserSelect, selectedUser, setIsProfileOpen, collapsed, onToggleCollapse }) => {
  const { logout, onlineUsers, authUser, socket, updateProfile, changePassword, deleteAccount } = useContext(AuthContext);
  const { 
    getUsers, 
    users, 
    setSelectedUser, 
    unseenMessages, 
    markMessagesAsSeen, 
    getMessage, 
    getMyGroups, 
    groups, 
    createGroup,
    searchUsers,
    searchUsersByEmail,
    searchGroups,
    friends = [],
    friendRequests = [],
    sentRequests = [],
    getFriends,
    getFriendsForSidebar,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    canSendMessageToUser,
    canSendFriendRequest,
    messages = {},
    getUnseenMessageCount,
    typingUsers = {},
    clearChatHistory,
    deleteGroup,
    leaveGroup,
    archiveChat,
    archivedChats = [],
    getArchivedChats,
    unarchiveChat
  } = useContext(ChatContext);
  
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [loading, setLoading] = useState(true);
  const [messageCounts, setMessageCounts] = useState({});
  const [userStats, setUserStats] = useState({
    totalMessages: 0,
    totalChats: 0,
    activeChats: 0,
    unreadCount: 0,
    groupsCount: 0,
    friendsCount: 0
  });
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    onlineOnly: false,
    friendsOnly: false,
    hasUnread: false
  });
  
  // Profile state
  const [showProfile, setShowProfile] = useState(false);
  
  // Archive functionality states
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [groupActionMenu, setGroupActionMenu] = useState(null);
  const [archivedGroups, setArchivedGroups] = useState([]);
  const [archivedUsers, setArchivedUsers] = useState([]);

  const dropdownRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const groupActionRef = useRef(null);

  // Enhanced friend checking
  const isUserFriend = useCallback((userId) => {
    if (!Array.isArray(friends) || !userId) return false;
    return friends.some(friend => friend._id === userId);
  }, [friends]);

  const hasSentFriendRequest = useCallback((userId) => {
    if (!Array.isArray(sentRequests) || !userId) return false;
    return sentRequests.some(request => {
      const toUserId = request.to?._id || request.to;
      return toUserId === userId && request.status === 'pending';
    });
  }, [sentRequests]);

  const hasReceivedFriendRequest = useCallback((userId) => {
    if (!Array.isArray(friendRequests) || !userId) return false;
    return friendRequests.some(request => {
      const fromUserId = request.from?._id || request.from;
      return fromUserId === userId && request.status === 'pending';
    });
  }, [friendRequests]);

  const getFriendRequestId = useCallback((userId) => {
    if (!Array.isArray(friendRequests) || !userId) return null;
    const request = friendRequests.find(req => {
      const fromUserId = req.from?._id || req.from;
      return fromUserId === userId && req.status === 'pending';
    });
    return request?._id || null;
  }, [friendRequests]);

  // Fixed message counting with proper deduplication
  const calculateMessageCounts = useCallback(() => {
    const counts = {};
    const seenMessageIds = new Set();
    const stats = {
      totalMessages: 0,
      totalChats: 0,
      activeChats: 0,
      unreadCount: 0,
      groupsCount: groups.length,
      friendsCount: friends.length
    };
    
    Object.keys(messages).forEach(chatId => {
      const chatMessages = Array.isArray(messages[chatId]) ? messages[chatId] : [];
      
      // Advanced deduplication with multiple criteria
      const uniqueMessages = chatMessages.filter(message => {
        if (!message || !message._id) return false;
        
        const messageKey = `${message._id}-${message.sender}-${message.timestamp}`;
        
        if (seenMessageIds.has(messageKey)) {
          return false;
        }
        
        seenMessageIds.add(messageKey);
        return true;
      });
      
      counts[chatId] = uniqueMessages.length;
      stats.totalMessages += uniqueMessages.length;
      
      if (uniqueMessages.length > 0) {
        stats.totalChats++;
        const unseenCount = unseenMessages[chatId] || 0;
        if (unseenCount > 0) {
          stats.activeChats++;
          stats.unreadCount += unseenCount;
        }
      }
    });
    
    setMessageCounts(counts);
    setUserStats(stats);
  }, [messages, unseenMessages, groups, friends]);

  // Load archived chats
  const loadArchivedChats = useCallback(async () => {
    try {
      if (getArchivedChats) {
        const archived = await getArchivedChats();
        if (archived && Array.isArray(archived)) {
          const archivedGroups = archived.filter(chat => chat.isGroup);
          const archivedUsers = archived.filter(chat => !chat.isGroup);
          setArchivedGroups(archivedGroups);
          setArchivedUsers(archivedUsers);
        }
      }
    } catch (error) {
      console.error('Error loading archived chats:', error);
    }
  }, [getArchivedChats]);

  useEffect(() => {
    calculateMessageCounts();
    loadArchivedChats();
  }, [calculateMessageCounts, loadArchivedChats]);

  // Enhanced data loading
  useEffect(() => { 
    if (authUser) {
      const loadData = async () => {
        setLoading(true);
        try {
          console.log('🔄 Loading sidebar data...');
          
          await getUsers();
          
          try {
            if (getFriendsForSidebar) {
              await getFriendsForSidebar();
            } else if (getFriends) {
              await getFriends();
            }
          } catch (friendError) {
            console.warn('⚠️ Could not load friends:', friendError);
          }
          
          if (activeTab === "groups") {
            await getMyGroups();
          }
          
          console.log('✅ Sidebar data loaded successfully');
        } catch (error) {
          console.error('❌ Error loading sidebar data:', error);
          toast.error("Failed to load some data");
        } finally {
          setLoading(false);
        }
      };
      
      loadData();
    }
  }, [authUser, activeTab, getUsers, getFriends, getFriendsForSidebar, getMyGroups]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
      if (groupActionRef.current && !groupActionRef.current.contains(event.target)) {
        setGroupActionMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced search with debouncing
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (!searchInput.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        let results = [];
        
        if (activeTab === "chats") {
          try {
            if (searchUsers) {
              results = await searchUsers(searchInput);
              results = results.filter((user, index, self) => 
                index === self.findIndex(u => u._id === user._id)
              );
            }
            
            if (results.length === 0) {
              results = users.filter(user => 
                user._id !== authUser?._id && (
                  user.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  user.username?.toLowerCase().includes(searchInput.toLowerCase())
                )
              );
            }

            if (searchFilters.onlineOnly) {
              results = results.filter(user => onlineUsers.includes(user._id));
            }
            if (searchFilters.friendsOnly) {
              results = results.filter(user => isUserFriend(user._id));
            }
            if (searchFilters.hasUnread) {
              results = results.filter(user => unseenMessages[user._id] > 0);
            }
          } catch (searchError) {
            results = users.filter(user => 
              user._id !== authUser?._id && (
                user.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchInput.toLowerCase())
              )
            );
          }
        } else {
          try {
            results = searchGroups ? await searchGroups(searchInput) : [];
            results = results.filter((group, index, self) => 
              index === self.findIndex(g => g._id === group._id)
            );
          } catch (groupError) {
            results = groups.filter(group => 
              group.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
              group.description?.toLowerCase().includes(searchInput.toLowerCase())
            );
          }
        }
        
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        const localResults = users.filter(user => 
          user._id !== authUser?._id && (
            user.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
            user.username?.toLowerCase().includes(searchInput.toLowerCase())
          )
        );
        setSearchResults(localResults);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchInput, activeTab, searchUsers, searchGroups, users, authUser, groups, searchFilters, onlineUsers, isUserFriend, unseenMessages]);

  useEffect(() => {
    setSearchInput("");
    setSearchResults([]);
  }, [activeTab]);

  // Enhanced user filtering
  const allAvailableUsers = useMemo(() => {
    const userMap = new Map();
    
    users.forEach(user => {
      if (user._id !== authUser?._id) {
        userMap.set(user._id, user);
      }
    });
    
    searchResults.forEach(user => {
      if (user._id !== authUser?._id) {
        userMap.set(user._id, user);
      }
    });
    
    return Array.from(userMap.values());
  }, [users, searchResults, authUser]);

  const friendsList = useMemo(() => 
    allAvailableUsers.filter(user => isUserFriend(user._id)),
    [allAvailableUsers, isUserFriend]
  );

  const nonFriendsList = useMemo(() => 
    allAvailableUsers.filter(user => !isUserFriend(user._id)),
    [allAvailableUsers, isUserFriend]
  );

  const filteredUsers = searchInput ? allAvailableUsers : users.filter(user => user._id !== authUser?._id);
  
  const displayGroups = useMemo(() => {
    const groupsToDisplay = searchInput ? searchResults : groups;
    const groupMap = new Map();
    
    groupsToDisplay.forEach(group => {
      groupMap.set(group._id, group);
    });
    
    return Array.from(groupMap.values());
  }, [searchInput, searchResults, groups]);

  // Enhanced GroupListItem with action menu
  const GroupListItem = React.memo(({ group, isSelected, unseenCount, onSelect }) => {
    const memberCount = group.members?.length || 0;
    const isAdmin = group.admin === authUser._id;
    const totalMessages = messageCounts[group._id] || 0;
    const isTyping = typingUsers[group._id];
    const onlineMembers = group.members?.filter(member => onlineUsers.includes(member._id)).length || 0;
    const isArchived = archivedGroups.some(archived => archived._id === group._id);

    const handleArchiveGroup = async (e) => {
      e.stopPropagation();
      try {
        if (archiveChat) {
          await archiveChat(group._id);
          toast.success("Group archived");
          setGroupActionMenu(null);
          await loadArchivedChats();
        }
      } catch (error) {
        console.error('Error archiving group:', error);
        toast.error("Failed to archive group");
      }
    };

    const handleUnarchiveGroup = async (e) => {
      e.stopPropagation();
      try {
        if (unarchiveChat) {
          await unarchiveChat(group._id);
          toast.success("Group unarchived");
          setGroupActionMenu(null);
          await loadArchivedChats();
        }
      } catch (error) {
        console.error('Error unarchiving group:', error);
        toast.error("Failed to unarchive group");
      }
    };

    const handleDeleteGroup = async (e) => {
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to delete the group "${group.name}"? This action cannot be undone!`)) {
        try {
          if (deleteGroup) {
            await deleteGroup(group._id);
            toast.success("Group deleted successfully");
            setGroupActionMenu(null);
          }
        } catch (error) {
          console.error('Error deleting group:', error);
          toast.error("Failed to delete group");
        }
      }
    };

    const handleLeaveGroup = async (e) => {
      e.stopPropagation();
      if (window.confirm(`Are you sure you want to leave the group "${group.name}"?`)) {
        try {
          if (leaveGroup) {
            await leaveGroup(group._id);
            toast.success("Left group successfully");
            setGroupActionMenu(null);
          }
        } catch (error) {
          console.error('Error leaving group:', error);
          toast.error("Failed to leave group");
        }
      }
    };

    return (
      <motion.div
        onClick={() => onSelect(group)}
        className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 group backdrop-blur-sm ${
          isSelected 
            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10' 
            : 'hover:bg-white/5 border border-transparent hover:border-white/10'
        } ${isArchived ? 'opacity-60' : ''}`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex-shrink-0">
          {group.image ? (
            <motion.img 
              src={group.image} 
              alt={group.name} 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-violet-500/50 group-hover:border-violet-400 transition-all duration-300"
              loading="lazy"
              whileHover={{ scale: 1.05 }}
            />
          ) : (
            <motion.div 
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-violet-500/50 group-hover:border-violet-400 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
            >
              <span className="text-white font-bold text-sm">
                {group.name?.[0]?.toUpperCase() || 'G'}
              </span>
            </motion.div>
          )}
          {isAdmin && (
            <motion.div 
              className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.2 }}
            >
              <span className="text-[8px] text-black font-bold">A</span>
            </motion.div>
          )}
          {isArchived && (
            <motion.div 
              className="absolute -top-1 -left-1 w-5 h-5 bg-gray-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.2 }}
            >
              <FiArchive size={8} className="text-white" />
            </motion.div>
          )}
        </div>
        
        {!collapsed && (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold truncate text-white text-sm">{group.name}</p>
              {isArchived && (
                <span className="text-xs text-gray-400 bg-gray-500/10 px-2 py-0.5 rounded-full">Archived</span>
              )}
            </div>
            {isTyping ? (
              <motion.span 
                className="text-xs text-violet-400 font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                typing...
              </motion.span>
            ) : (
              <span className="text-xs text-gray-400 truncate">
                {memberCount} {memberCount === 1 ? 'member' : 'members'}
                {onlineMembers > 0 && ` • ${onlineMembers} online`}
                {group.description && ` • ${group.description}`}
              </span>
            )}
            
            {totalMessages > 0 && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-400">Messages:</span>
                <span className="text-xs text-violet-400 font-medium">{totalMessages}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {unseenCount > 0 && !isArchived && (
            <motion.div 
              className="flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs text-white font-bold shadow-lg">
                {unseenCount > 99 ? '99+' : unseenCount}
              </div>
            </motion.div>
          )}
          
          {!collapsed && (
            <div className="relative" ref={groupActionRef}>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  setGroupActionMenu(groupActionMenu === group._id ? null : group._id);
                }}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 opacity-0 group-hover:opacity-100"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiMoreVertical size={16} />
              </motion.button>

              <AnimatePresence>
                {groupActionMenu === group._id && (
                  <motion.div
                    className="absolute right-0 top-full z-30 w-48 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  >
                    {!isArchived ? (
                      <>
                        <motion.button
                          onClick={handleArchiveGroup}
                          className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                          whileHover={{ x: 4 }}
                        >
                          <FiArchive size={16} />
                          Archive Chat
                        </motion.button>
                        
                        {isAdmin ? (
                          <motion.button
                            onClick={handleDeleteGroup}
                            className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                            whileHover={{ x: 4 }}
                          >
                            <FiTrash size={16} />
                            Delete Group
                          </motion.button>
                        ) : (
                          <motion.button
                            onClick={handleLeaveGroup}
                            className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                            whileHover={{ x: 4 }}
                          >
                            <FiExit size={16} />
                            Leave Group
                          </motion.button>
                        )}
                      </>
                    ) : (
                      <motion.button
                        onClick={handleUnarchiveGroup}
                        className="flex items-center gap-3 w-full p-3 text-sm text-green-400 hover:bg-green-500/10 rounded-xl transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <FiRefreshCw size={16} />
                        Unarchive Chat
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    );
  });

  // Enhanced UserListItem with archive functionality
  const UserListItem = React.memo(({ user, isOnline, isSelected, unseenCount, onSelect, showEmail = false, isArchived = false }) => {
    const isFriend = isUserFriend(user._id);
    const hasSentRequest = hasSentFriendRequest(user._id);
    const hasReceivedRequest = hasReceivedFriendRequest(user._id);
    const requestId = getFriendRequestId(user._id);
    const canChat = isFriend && canSendMessageToUser(user);
    const canSendRequest = canSendFriendRequest(user);
    const isTyping = typingUsers[user._id] === user._id;
    const totalMessages = messageCounts[user._id] || 0;

    const handleArchiveUser = async (e) => {
      e.stopPropagation();
      try {
        if (archiveChat) {
          await archiveChat(user._id);
          toast.success("Chat archived");
          await loadArchivedChats();
        }
      } catch (error) {
        console.error('Error archiving user chat:', error);
        toast.error("Failed to archive chat");
      }
    };

    const handleUnarchiveUser = async (e) => {
      e.stopPropagation();
      try {
        if (unarchiveChat) {
          await unarchiveChat(user._id);
          toast.success("Chat unarchived");
          await loadArchivedChats();
        }
      } catch (error) {
        console.error('Error unarchiving user chat:', error);
        toast.error("Failed to unarchive chat");
      }
    };

    const handleSendFriendRequest = async (userId) => {
      try {
        if (!sendFriendRequest) {
          toast.error("Friend request feature is not available");
          return;
        }

        let targetUser = null;
        
        if (searchResults.length > 0) {
          targetUser = searchResults.find(u => u._id === userId);
        }
        
        if (!targetUser) {
          targetUser = users.find(u => u._id === userId);
        }
        
        if (!targetUser && Array.isArray(friends)) {
          targetUser = friends.find(friend => friend._id === userId);
        }

        if (!targetUser) {
          toast.error("User not found. Please try searching again.");
          return;
        }

        if (!canSendFriendRequest(targetUser)) {
          toast.error("Cannot send friend request to this user due to their privacy settings");
          return;
        }

        const success = await sendFriendRequest(userId);
        
        if (success) {
          toast.success("Friend request sent!");
          if (getFriends) await getFriends();
          if (getUsers) await getUsers();
        }
      } catch (error) {
        console.error('❌ Sidebar: Unexpected error:', error);
        toast.error(error.response?.data?.message || "An unexpected error occurred");
      }
    };

    const handleAcceptFriendRequest = async (requestId) => {
      try {
        if (!acceptFriendRequest) {
          toast.error("Friend request acceptance not available");
          return;
        }

        if (!requestId) {
          toast.error("Invalid friend request");
          return;
        }

        const success = await acceptFriendRequest(requestId);
        if (success) {
          toast.success("Friend request accepted!");
          setShowFriendRequests(false);
          if (getFriends) await getFriends();
          if (getUsers) await getUsers();
        } else {
          toast.error("Failed to accept friend request");
        }
      } catch (error) {
        console.error('❌ Failed to accept friend request:', error);
        toast.error(error.response?.data?.message || "Failed to accept friend request");
      }
    };

    const handleRejectFriendRequest = async (requestId) => {
      try {
        if (!rejectFriendRequest) {
          toast.error("Friend request rejection not available");
          return;
        }

        if (!requestId) {
          toast.error("Invalid friend request");
          return;
        }

        const success = await rejectFriendRequest(requestId);
        if (success) {
          toast.success("Friend request rejected");
          setShowFriendRequests(false);
          if (getFriends) await getFriends();
          if (getUsers) await getUsers();
        } else {
          toast.error("Failed to reject friend request");
        }
      } catch (error) {
        console.error('❌ Failed to reject friend request:', error);
        toast.error(error.response?.data?.message || "Failed to reject friend request");
      }
    };

    const handleRemoveFriend = async (userId) => {
      if (window.confirm("Are you sure you want to remove this friend?")) {
        try {
          const success = removeFriend ? await removeFriend(userId) : false;
          if (success) {
            toast.success("Friend removed");
            if (getFriends) await getFriends();
            if (getUsers) await getUsers();
          } else {
            toast.error("Failed to remove friend");
          }
        } catch (error) {
          console.error('Failed to remove friend:', error);
          toast.error("Failed to remove friend");
        }
      }
    };

    const getFriendButton = () => {
      if (isArchived) {
        return (
          <motion.button
            onClick={handleUnarchiveUser}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
            title="Unarchive chat"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiRefreshCw size={16} />
          </motion.button>
        );
      }

      if (isFriend) {
        return (
          <div className="flex gap-1">
            {canChat ? (
              <>
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(user);
                  }}
                  className="p-2 text-violet-400 hover:text-white hover:bg-violet-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Start chat"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiMessageSquare size={16} />
                </motion.button>
                <motion.button
                  onClick={handleArchiveUser}
                  className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-110"
                  title="Archive chat"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiArchive size={16} />
                </motion.button>
              </>
            ) : (
              <button
                disabled
                className="p-2 text-gray-400 opacity-50 cursor-not-allowed"
                title="Messaging disabled"
              >
                <FiMessageSquare size={16} />
              </button>
            )}
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFriend(user._id);
              }}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
              title="Remove friend"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <FiUserX size={16} />
            </motion.button>
          </div>
        );
      } else {
        if (hasSentRequest) {
          return (
            <button
              disabled
              className="p-2 text-yellow-400 opacity-50 cursor-not-allowed rounded-xl"
              title="Request sent"
            >
              <RiCheckboxCircleLine size={16} />
            </button>
          );
        } else if (hasReceivedRequest) {
          return (
            <div className="flex gap-1">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptFriendRequest(requestId);
                }}
                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Accept request"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiCheck size={16} />
              </motion.button>
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectFriendRequest(requestId);
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Reject request"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <FiX size={16} />
              </motion.button>
            </div>
          );
        } else {
          return (
            <motion.button
              onClick={(e) => {
                e.stopPropagation();
                handleSendFriendRequest(user._id);
              }}
              className={`p-2 rounded-xl transition-all duration-200 hover:scale-110 ${
                canSendRequest 
                  ? 'text-violet-400 hover:text-violet-300 hover:bg-violet-500/20' 
                  : 'text-gray-400 opacity-50 cursor-not-allowed'
              }`}
              title={canSendRequest ? "Add friend" : "Cannot send friend request"}
              disabled={!canSendRequest}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RiUserAddLine size={16} />
            </motion.button>
          );
        }
      }
    };

    return (
      <motion.div
        onClick={() => {
          if (isArchived) {
            handleUnarchiveUser();
            return;
          }
          if (isFriend && canChat) {
            onSelect(user);
          } else if (isFriend && !canChat) {
            toast("Cannot message this friend due to their privacy settings", {
              icon: '🔒',
              style: {
                background: '#8b5cf6',
                color: 'white',
              },
            });
          } else {
            toast("Add this user as a friend to start chatting", {
              icon: '👥',
              style: {
                background: '#8b5cf6',
                color: 'white',
              },
            });
          }
        }}
        className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 group backdrop-blur-sm ${
          isSelected && canChat && !isArchived
            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10' 
            : 'hover:bg-white/5 border border-transparent hover:border-white/10'
        } ${
          (!isFriend || !canChat) && !isArchived ? 'opacity-70 cursor-not-allowed' : ''
        } ${isArchived ? 'opacity-60 bg-gray-500/10' : ''}`}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative flex-shrink-0">
          <motion.div 
            className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold relative overflow-hidden border-2 ${
              isFriend && canChat && !isArchived
                ? 'border-violet-400 group-hover:border-violet-300' 
                : 'border-gray-500'
            } transition-all duration-300`}
            whileHover={{ scale: 1.05 }}
          >
            {user.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.fullName} 
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              getInitials(user.fullName)
            )}
            {isArchived && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <FiArchive size={20} className="text-white" />
              </div>
            )}
          </motion.div>
          
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            {isOnline && !isArchived && (
              <motion.div 
                className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c2e]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}
            {isFriend && !isArchived && (
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center">
                <FiUserCheck size={8} className="text-white" />
              </div>
            )}
            {isArchived && (
              <div className="w-3 h-3 bg-gray-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center">
                <FiArchive size={8} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        {!collapsed && (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold truncate text-white text-sm">{user.fullName}</p>
              {isArchived ? (
                <span className="text-xs text-gray-400 font-medium bg-gray-500/10 px-2 py-0.5 rounded-full">Archived</span>
              ) : isFriend ? (
                canChat ? (
                  <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-0.5 rounded-full">Friend</span>
                ) : (
                  <span className="text-xs text-yellow-400 font-medium bg-yellow-500/10 px-2 py-0.5 rounded-full">No Chat</span>
                )
              ) : (
                <span className="text-xs text-gray-400 font-medium bg-gray-500/10 px-2 py-0.5 rounded-full">Not Friend</span>
              )}
            </div>
            
            <div className="flex flex-col gap-0.5">
              {isTyping && !isArchived ? (
                <motion.span 
                  className="text-xs text-violet-400 font-medium flex items-center gap-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <FiEdit3 size={10} />
                  typing...
                </motion.span>
              ) : (
                <>
                  {showEmail && user.email && (
                    <span className="text-xs text-violet-300/80 truncate flex items-center gap-1">
                      <FiMail size={10} />
                      {user.email}
                    </span>
                  )}
                  {user.username && (
                    <span className="text-xs text-gray-400 truncate">
                      @{user.username}
                    </span>
                  )}
                  {!isArchived && (
                    <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'} truncate font-medium`}>
                      {isOnline ? '🟢 Online' : '⚫ Offline'}
                    </span>
                  )}
                </>
              )}
            </div>
            
            {totalMessages > 0 && !isArchived && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-gray-400">Messages:</span>
                <span className="text-xs text-violet-400 font-medium">{totalMessages}</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {unseenCount > 0 && canChat && !isArchived && (
            <motion.div 
              className="flex-shrink-0"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
            >
              <div className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs text-white font-bold shadow-lg">
                {unseenCount > 99 ? '99+' : unseenCount}
              </div>
            </motion.div>
          )}
          {!collapsed && getFriendButton()}
        </div>
      </motion.div>
    );
  });

  // Archived Chats Section Component
  const ArchivedChatsSection = () => (
    <motion.div
      className="mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <FiArchive className="text-gray-400" size={18} />
          <span className="text-sm font-semibold text-gray-400">Archived Chats</span>
          <span className="text-xs bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full">
            {archivedGroups.length + archivedUsers.length}
          </span>
        </div>
        <motion.button
          onClick={() => setShowArchivedChats(!showArchivedChats)}
          className="text-gray-400 hover:text-white p-1 transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiEye size={16} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showArchivedChats && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            {/* Archived Groups */}
            {archivedGroups.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <RiGroupLine size={16} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400">Groups ({archivedGroups.length})</span>
                </div>
                {archivedGroups.map(group => (
                  <GroupListItem 
                    key={group._id}
                    group={group}
                    isSelected={selectedUser?._id === group._id}
                    unseenCount={0}
                    onSelect={selectGroup}
                  />
                ))}
              </div>
            )}

            {/* Archived Users */}
            {archivedUsers.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2 px-2">
                  <FiUser size={16} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-400">Users ({archivedUsers.length})</span>
                </div>
                {archivedUsers.map(user => (
                  <UserListItem 
                    key={user._id}
                    user={user}
                    isOnline={onlineUsers.includes(user._id)}
                    isSelected={selectedUser?._id === user._id}
                    unseenCount={0}
                    onSelect={selectUser}
                    isArchived={true}
                  />
                ))}
              </div>
            )}

            {archivedGroups.length === 0 && archivedUsers.length === 0 && (
              <motion.div 
                className="flex flex-col items-center justify-center py-8 px-4 text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FiArchive size={32} className="opacity-50 mb-2" />
                <p className="text-sm text-center">No archived chats</p>
                <p className="text-xs text-center mt-1">Archive chats to hide them from main view</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );

  // Enhanced group creation
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      toast.error("Group name is required");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }
    
    const isDuplicate = groups.some(group => 
      group.name.toLowerCase() === groupName.toLowerCase().trim() &&
      group.members.length === selectedMembers.length + 1 &&
      selectedMembers.every(member => group.members.includes(member._id))
    );
    
    if (isDuplicate) {
      toast.error("A group with the same name and members already exists");
      return;
    }
    
    try {
      await createGroup({ 
        name: groupName.trim(), 
        members: selectedMembers.map(m => m._id),
        description: groupDescription.trim()
      });
      setShowGroupModal(false);
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
      toast.success("Group created successfully!");
    } catch (err) {
      console.error("Group creation error:", err);
      toast.error(err.response?.data?.message || "Failed to create group");
    }
  };

  const toggleMember = (user) => {
    setSelectedMembers(prev => 
      prev.some(m => m._id === user._id) 
        ? prev.filter(m => m._id !== user._id) 
        : [...prev, user]
    );
  };

  const selectUser = async (user) => {
    try {
      if (!canSendMessageToUser(user)) {
        toast("Cannot message this user. You need to be friends first.", {
          icon: '👥',
          style: {
            background: '#8b5cf6',
            color: 'white',
          },
        });
        return;
      }
      
      setSelectedUser(user);
      if (onUserSelect) onUserSelect(user);
      await getMessage(user._id);
      markMessagesAsSeen(user._id);
    } catch (error) {
      console.error("Error selecting user:", error);
      toast.error("Failed to load messages");
    }
  };

  const selectGroup = async (group) => {
    try {
      setSelectedUser(group);
      if (onUserSelect) onUserSelect(group);
      if (socket) {
        socket.emit("joinGroup", group._id);
      }
      await getMessage(group._id);
      markMessagesAsSeen(group._id);
    } catch (error) {
      console.error("Error selecting group:", error);
      toast.error("Failed to load group messages");
    }
  };

  // Enhanced Profile Functions
  const handleProfileClick = () => {
    setShowProfile(true);
    if (setIsProfileOpen) {
      setIsProfileOpen(true);
    }
  };

  const handleBackToChats = () => {
    setShowProfile(false);
    if (setIsProfileOpen) {
      setIsProfileOpen(false);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchResults([]);
    setSearchFilters({
      onlineOnly: false,
      friendsOnly: false,
      hasUnread: false
    });
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  // Enhanced FriendRequestItem component
  const FriendRequestItem = ({ request }) => {
    const requestData = request.from || request;
    const requestId = request._id;
    
    if (!requestData) {
      console.warn('Invalid friend request data:', request);
      return null;
    }

    return (
      <motion.div 
        className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300"
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
          {requestData.profilePic ? (
            <img src={requestData.profilePic} alt={requestData.fullName} className="w-full h-full rounded-xl object-cover" />
          ) : (
            getInitials(requestData.fullName)
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-semibold text-sm text-white truncate">{requestData.fullName || 'Unknown User'}</p>
          <span className="text-xs text-gray-400">Wants to be your friend</span>
        </div>
        <div className="flex gap-1">
          <motion.button
            onClick={() => handleAcceptFriendRequest(requestId)}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
            title="Accept"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiCheck size={16} />
          </motion.button>
          <motion.button
            onClick={() => handleRejectFriendRequest(requestId)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
            title="Reject"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <FiX size={16} />
          </motion.button>
        </div>
      </motion.div>
    );
  };

  // Advanced Search Filters Component
  const AdvancedSearchFilters = () => (
    <motion.div 
      className="p-3 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 space-y-3"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-gray-300">Advanced Filters</span>
        <motion.button
          onClick={() => setShowAdvancedSearch(false)}
          className="text-gray-400 hover:text-white p-1"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <FiX size={14} />
        </motion.button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <motion.label 
          className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <input
            type="checkbox"
            checked={searchFilters.onlineOnly}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, onlineOnly: e.target.checked }))}
            className="rounded border-white/20 bg-white/5"
          />
          Online Only
        </motion.label>
        <motion.label 
          className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <input
            type="checkbox"
            checked={searchFilters.friendsOnly}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, friendsOnly: e.target.checked }))}
            className="rounded border-white/20 bg-white/5"
          />
          Friends Only
        </motion.label>
        <motion.label 
          className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer"
          whileHover={{ scale: 1.02 }}
        >
          <input
            type="checkbox"
            checked={searchFilters.hasUnread}
            onChange={(e) => setSearchFilters(prev => ({ ...prev, hasUnread: e.target.checked }))}
            className="rounded border-white/20 bg-white/5"
          />
          Unread Messages
        </motion.label>
      </div>
    </motion.div>
  );

  // Render functions for different sections
  const renderChatsSection = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4 px-6">
        {isSearching ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-32 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm mt-3">Searching users...</p>
          </motion.div>
        ) : filteredUsers.length > 0 ? (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Archived Chats Section */}
            {(archivedGroups.length > 0 || archivedUsers.length > 0) && (
              <ArchivedChatsSection />
            )}

            {/* Friends Section */}
            {friendsList.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {!collapsed && (
                  <div className="flex items-center gap-2 mb-3 px-2">
                    <FiUserCheck size={18} className="text-blue-400" />
                    <span className="text-sm font-semibold text-blue-400">
                      Friends ({friendsList.filter(user => canSendMessageToUser(user)).length})
                    </span>
                  </div>
                )}
                <div className="space-y-2">
                  {friendsList
                    .filter(user => canSendMessageToUser(user) && !archivedUsers.some(archived => archived._id === user._id))
                    .map(user => (
                    <UserListItem 
                      key={user._id}
                      user={user}
                      isOnline={onlineUsers.includes(user._id)}
                      isSelected={selectedUser?._id === user._id}
                      unseenCount={unseenMessages[user._id] || 0}
                      onSelect={selectUser}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Non-Friends Section */}
            {searchInput && nonFriendsList.length > 0 && !collapsed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3 px-2">
                  <FiUsers size={18} className="text-gray-400" />
                  <span className="text-sm font-semibold text-gray-400">
                    Other Users ({nonFriendsList.length})
                  </span>
                </div>
                <div className="space-y-2">
                  {nonFriendsList.map(user => (
                    <UserListItem 
                      key={user._id}
                      user={user}
                      isOnline={onlineUsers.includes(user._id)}
                      isSelected={selectedUser?._id === user._id}
                      unseenCount={0}
                      onSelect={() => {
                        toast("Add this user as a friend to start chatting", {
                          icon: '👥',
                          style: {
                            background: '#8b5cf6',
                            color: 'white',
                          },
                        });
                      }}
                      showEmail={true}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Empty state */}
            {friendsList.length === 0 && !searchInput && !collapsed && (
              <motion.div 
                className="flex flex-col items-center justify-center h-48 text-gray-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                  <FiUsers size={32} className="opacity-50" />
                </div>
                <p className="text-center text-sm font-medium">No friends yet</p>
                <p className="text-xs mt-2 text-center text-gray-500">Add friends to start chatting</p>
                <motion.button 
                  onClick={() => setSearchInput("")}
                  className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Search for users
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : (
          !collapsed && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <FiUsers size={24} className="opacity-50" />
              </div>
              <p className="text-center text-sm font-medium">
                {searchInput ? "No users found" : "No friends available"}
              </p>
              {searchInput ? (
                <p className="text-xs mt-2 text-center text-gray-500">Try adjusting your search terms</p>
              ) : (
                <p className="text-xs mt-2 text-center text-gray-500">Add friends to start chatting</p>
              )}
            </motion.div>
          )
        )}
      </div>

      {/* Create Group FAB */}
      {!collapsed && (
        <motion.div 
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.button 
            onClick={() => setShowGroupModal(true)}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <FiPlus size={18} />
            Create Group
          </motion.button>
        </motion.div>
      )}
    </div>
  );

  const renderGroupsSection = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto py-4 px-6">
        {isSearching ? (
          <motion.div 
            className="flex flex-col items-center justify-center h-32 text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-sm mt-3">Searching groups...</p>
          </motion.div>
        ) : displayGroups && displayGroups.length > 0 ? (
          <motion.div 
            className="space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Show only non-archived groups in main groups tab */}
            {displayGroups
              .filter(group => !archivedGroups.some(archived => archived._id === group._id))
              .map(group => (
              <GroupListItem 
                key={group._id}
                group={group}
                isSelected={selectedUser?._id === group._id}
                unseenCount={unseenMessages[group._id] || 0}
                onSelect={selectGroup}
              />
            ))}
          </motion.div>
        ) : (
          !collapsed && (
            <motion.div 
              className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                <RiGroupLine size={24} className="opacity-50" />
              </div>
              <p className="text-center text-sm font-medium">
                {searchInput ? "No groups found" : "No groups yet"}
              </p>
              {!searchInput && (
                <motion.button 
                  onClick={() => setShowGroupModal(true)}
                  className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Create your first group
                </motion.button>
              )}
            </motion.div>
          )
        )}
      </div>
    </div>
  );

  // If profile is shown, render the Profile component
  if (showProfile) {
    return (
      <Profile 
        onClose={handleBackToChats} 
        isMobile={isMobile}
      />
    );
  }

  if (loading) {
    return (
      <div className={`h-full flex flex-col text-white bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl ${
        isMobile ? 'w-full absolute inset-0 z-40' : 'w-full'
      }`}>
        <div className="flex-1 flex items-center justify-center">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div 
              className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="text-gray-400 text-sm">Loading your chats...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col text-white bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl border-r border-white/10 ${
      isMobile ? 'w-full absolute inset-0 z-40' : 'w-full'
    }`}>
      {/* Header Section */}
      <div className="p-6 pb-4 flex-shrink-0 border-b border-white/10">
        <div className="flex justify-between items-center mb-6">
          {/* Profile Section */}
          <motion.div 
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-2xl transition-all duration-300 flex-1 min-w-0 group"
            onClick={handleProfileClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="relative flex-shrink-0">
              <motion.div 
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-violet-500/50 group-hover:border-violet-400 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                {authUser?.profilePic ? (
                  <img src={authUser.profilePic} alt="My Profile" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  getInitials(authUser?.fullName)
                )}
              </motion.div>
              <motion.div 
                className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c2e]"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate text-white cursor-pointer">
                  {authUser?.fullName || 'My Profile'}
                </span>
                <span className="text-xs text-violet-300/80 truncate cursor-pointer">View profile</span>
                <span className="text-xs text-gray-500 truncate">
                  {userStats.activeChats} active chats
                </span>
              </div>
            )}
          </motion.div>
          
          {!collapsed && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Collapse Toggle Button */}
              <motion.button 
                onClick={onToggleCollapse}
                className="p-3 hover:bg-white/5 rounded-xl transition-all duration-300 hover:scale-105 group"
                title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiGrid size={18} className="text-gray-400 group-hover:text-violet-400" />
              </motion.button>

              {/* Friend Requests Button */}
              <motion.button 
                onClick={() => setShowFriendRequests(!showFriendRequests)}
                className="relative p-3 hover:bg-white/5 rounded-xl transition-all duration-300 hover:scale-105 group"
                title="Friend Requests"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiBell size={18} className="text-gray-400 group-hover:text-violet-400" />
                {friendRequests.length > 0 && (
                  <motion.div 
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.2 }}
                  >
                    <span className="text-xs text-white font-bold">
                      {friendRequests.length > 9 ? '9+' : friendRequests.length}
                    </span>
                  </motion.div>
                )}
              </motion.button>
              
              {/* More Options Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <motion.button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-3 hover:bg-white/5 rounded-xl transition-all duration-300 hover:scale-105 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <FiMoreVertical size={18} className="text-gray-400 group-hover:text-violet-400" />
                </motion.button>
                
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div 
                      className="absolute top-full right-0 z-20 w-56 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    >
                      <motion.button 
                        onClick={handleProfileClick}
                        className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <FiUser size={16} />
                        Profile & Settings
                      </motion.button>
                      <motion.button 
                        onClick={() => setShowGroupModal(true)}
                        className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <RiGroupLine size={16} />
                        Create Group
                      </motion.button>
                      <motion.button 
                        onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                        className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <FiSearch size={16} />
                        Advanced Search
                      </motion.button>
                      <hr className="my-2 border-t border-white/10" />
                      <motion.button 
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                        whileHover={{ x: 4 }}
                      >
                        <FiLogOut size={16} />
                        Logout
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Friend Requests Dropdown */}
        {showFriendRequests && friendRequests.length > 0 && !collapsed && (
          <motion.div 
            className="mb-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-h-60 overflow-y-auto"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Friend Requests</h4>
              <span className="text-xs text-violet-300 bg-violet-500/10 px-2 py-1 rounded-full">{friendRequests.length} pending</span>
            </div>
            <div className="space-y-2">
              {friendRequests.map((request, index) => (
                <FriendRequestItem key={request._id || index} request={request} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Advanced Search Filters */}
        <AnimatePresence>
          {showAdvancedSearch && !collapsed && <AdvancedSearchFilters />}
        </AnimatePresence>

        {/* Search Bar */}
        {!collapsed && (
          <motion.div 
            className={`${showFriendRequests && friendRequests.length > 0 ? 'mt-4' : 'mt-2'}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl flex items-center gap-3 py-3 px-4 border border-white/10 focus-within:border-violet-500/50 focus-within:ring-2 focus-within:ring-violet-500/20 transition-all duration-300">
              <FiSearch className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder={activeTab === "chats" ? "Search users..." : "Search groups..."}
                className="bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 flex-1 min-w-0"
              />
              {searchInput && (
                <motion.button 
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-white transition-all duration-200 p-1 flex-shrink-0 hover:scale-110"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FiX size={16} />
                </motion.button>
              )}
              <motion.button 
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="text-gray-400 hover:text-violet-400 transition-all duration-200 p-1 flex-shrink-0 hover:scale-110"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                title="Advanced search"
              >
                <FiSettings size={14} />
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Navigation Tabs */}
      {!collapsed && (
        <motion.div 
          className="px-6 pb-4 flex-shrink-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1">
            <motion.button 
              onClick={() => setActiveTab("chats")}
              className={`flex items-center justify-center flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === "chats" 
                  ? "text-white bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiMessageSquare size={18} className="mr-2 flex-shrink-0" /> 
              <span className="truncate">Chats</span>
              {userStats.unreadCount > 0 && (
                <motion.span 
                  className="ml-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {userStats.unreadCount > 9 ? '9+' : userStats.unreadCount}
                </motion.span>
              )}
            </motion.button>
            <motion.button 
              onClick={() => setActiveTab("groups")}
              className={`flex items-center justify-center flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === "groups" 
                  ? "text-white bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FiUsers size={18} className="mr-2 flex-shrink-0" /> 
              <span className="truncate">Groups</span>
              <span className="ml-2 w-5 h-5 bg-blue-500/20 text-blue-400 text-xs rounded-full flex items-center justify-center">
                {groups.length}
              </span>
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chats" && renderChatsSection()}
        {activeTab === "groups" && renderGroupsSection()}
      </div>

      {/* Group Creation Modal */}
      <AnimatePresence>
        {showGroupModal && (
          <motion.div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl max-w-md w-full mx-auto border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="p-8 overflow-y-auto max-h-[80vh]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Create New Group</h3>
                  <motion.button 
                    onClick={() => setShowGroupModal(false)} 
                    className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <FiX size={24} />
                  </motion.button>
                </div>
                
                <form onSubmit={handleCreateGroup} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Group Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter group name..."
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300"
                      required
                      maxLength={50}
                    />
                    <p className="text-xs text-gray-400 mt-2">{groupName.length}/50 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Description (Optional)
                    </label>
                    <textarea
                      placeholder="Group description..."
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all duration-300 resize-none"
                      rows="3"
                      maxLength={200}
                    />
                    <p className="text-xs text-gray-400 mt-2">{groupDescription.length}/200 characters</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-3">
                      Select Members ({selectedMembers.length} selected) *
                    </label>
                    <div className="max-h-48 overflow-y-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-2">
                      {users
                        .filter(u => u._id !== authUser._id)
                        .map(user => (
                        <motion.div 
                          key={user._id} 
                          className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                            selectedMembers.some(m => m._id === user._id) 
                              ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30' 
                              : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                          }`}
                          onClick={() => toggleMember(user)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                            selectedMembers.some(m => m._id === user._id) 
                              ? 'bg-violet-500 border-violet-500' 
                              : 'border-gray-500'
                          }`}>
                            {selectedMembers.some(m => m._id === user._id) && (
                              <FiCheck size={12} className="text-white" />
                            )}
                          </div>
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                            {user.profilePic ? (
                              <img src={user.profilePic} alt="" className="w-full h-full rounded-xl object-cover" />
                            ) : (
                              getInitials(user.fullName)
                            )}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-sm font-medium text-white truncate">{user.fullName}</span>
                            <span className="text-xs text-gray-400 truncate">
                              {onlineUsers.includes(user._id) ? '🟢 Online' : '⚫ Offline'}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                    {users.filter(u => u._id !== authUser._id).length === 0 && (
                      <p className="text-sm text-gray-400 text-center py-6">
                        No users available to add to group
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-4 pt-4">
                    <motion.button 
                      type="button" 
                      onClick={() => {
                        setShowGroupModal(false);
                        setGroupName("");
                        setGroupDescription("");
                        setSelectedMembers([]);
                      }} 
                      className="flex-1 p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-95"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button 
                      type="submit" 
                      className="flex-1 p-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!groupName.trim() || selectedMembers.length === 0}
                      whileHover={{ scale: selectedMembers.length > 0 ? 1.02 : 1 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Create Group
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance monitoring */}
      {process.env.NODE_ENV === 'development' && !collapsed && (
        <motion.div 
          className="hidden md:block absolute bottom-2 right-2 text-xs text-gray-500 backdrop-blur-sm bg-black/20 px-2 py-1 rounded"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Users: {users.length} | Groups: {groups.length} | Messages: {userStats.totalMessages}
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(Sidebar);