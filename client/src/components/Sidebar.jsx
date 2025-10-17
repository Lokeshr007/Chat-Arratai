import React, { useEffect, useState, useContext, useRef, useMemo } from "react";
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
  FiShield
} from "react-icons/fi";
import { 
  RiGroupLine, 
  RiUserAddLine, 
  RiCheckboxCircleLine,
  RiCloseCircleLine 
} from "react-icons/ri";
import toast from "react-hot-toast";

const Sidebar = ({ isMobile, onUserSelect, selectedUser, setIsProfileOpen, collapsed, onToggleCollapse }) => {
  const { logout, onlineUsers, authUser, socket, updateProfile, changePassword } = useContext(AuthContext);
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
    canSendFriendRequest
  } = useContext(ChatContext);
  
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chats");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showFriendRequests, setShowFriendRequests] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [showProfile, setShowProfile] = useState(false);
  const [name, setName] = useState(authUser?.fullName || '');
  const [bio, setBio] = useState(authUser?.bio || '');
  const [username, setUsername] = useState(authUser?.username || '');
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const dropdownRef = useRef(null);

  // Enhanced friend checking with proper validation
  const isUserFriend = (userId) => {
    if (!Array.isArray(friends) || !userId) return false;
    return friends.some(friend => friend._id === userId);
  };

  // Check if friend request already sent to a user
  const hasSentFriendRequest = (userId) => {
    if (!Array.isArray(sentRequests) || !userId) return false;
    return sentRequests.some(request => {
      const toUserId = request.to?._id || request.to;
      return toUserId === userId && request.status === 'pending';
    });
  };

  // Check if received friend request from a user
  const hasReceivedFriendRequest = (userId) => {
    if (!Array.isArray(friendRequests) || !userId) return false;
    return friendRequests.some(request => {
      const fromUserId = request.from?._id || request.from;
      return fromUserId === userId && request.status === 'pending';
    });
  };

  // Get the actual request ID for a received friend request
  const getFriendRequestId = (userId) => {
    if (!Array.isArray(friendRequests) || !userId) return null;
    const request = friendRequests.find(req => {
      const fromUserId = req.from?._id || req.from;
      return fromUserId === userId && req.status === 'pending';
    });
    return request?._id || null;
  };

  // Enhanced data loading with proper error handling
  useEffect(() => { 
    if (authUser) {
      const loadData = async () => {
        setLoading(true);
        try {
          console.log('🔄 Loading sidebar data...');
          
          // Load users first
          await getUsers();
          
          // Try to load friends
          try {
            if (getFriendsForSidebar) {
              await getFriendsForSidebar();
            } else if (getFriends) {
              await getFriends();
            }
          } catch (friendError) {
            console.warn('⚠️ Could not load friends, continuing without friends data:', friendError);
          }
          
          // Load groups if needed
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enhanced search with better user handling
  useEffect(() => {
    if (!searchInput.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        let results = [];
        
        if (activeTab === "chats") {
          try {
            // Use enhanced search if available
            if (searchUsers) {
              console.log('🔍 Searching users with query:', searchInput);
              results = await searchUsers(searchInput);
              console.log('✅ Search results found:', results.length);
              
              // Store search results globally for friend request function
              window.searchResults = results;
            }
            
            // Fallback to comprehensive local search
            if (results.length === 0) {
              console.log('🔍 Using enhanced local search fallback');
              results = users.filter(user => 
                user._id !== authUser?._id && (
                  user.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  user.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
                  user.username?.toLowerCase().includes(searchInput.toLowerCase())
                )
              );
            }
          } catch (searchError) {
            console.log("🔍 Using local search fallback due to error:", searchError);
            // Comprehensive local search fallback
            results = users.filter(user => 
              user._id !== authUser?._id && (
                user.fullName?.toLowerCase().includes(searchInput.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchInput.toLowerCase()) ||
                user.username?.toLowerCase().includes(searchInput.toLowerCase())
              )
            );
          }
        } else {
          // Group search
          try {
            results = searchGroups ? await searchGroups(searchInput) : [];
          } catch (groupError) {
            console.warn('Group search failed, using local fallback:', groupError);
            results = groups.filter(group => 
              group.name?.toLowerCase().includes(searchInput.toLowerCase()) ||
              group.description?.toLowerCase().includes(searchInput.toLowerCase())
            );
          }
        }
        
        setSearchResults(results);
        console.log('🔍 Final search results:', results.length);
      } catch (error) {
        console.error("Search error:", error);
        // Fallback to local search
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
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchInput, activeTab, searchUsers, searchUsersByEmail, searchGroups, users, authUser, groups]);

  useEffect(() => {
    setSearchInput("");
    setSearchResults([]);
  }, [activeTab]);

  // Enhanced user filtering that includes search results
  const allAvailableUsers = useMemo(() => {
    // Combine regular users and search results, removing duplicates
    const combined = [...users];
    
    searchResults.forEach(searchUser => {
      if (!combined.some(user => user._id === searchUser._id)) {
        combined.push(searchUser);
      }
    });
    
    return combined.filter(user => user._id !== authUser?._id);
  }, [users, searchResults, authUser]);

  // Friends are users who are actually friends
  const friendsList = allAvailableUsers.filter(user => 
    isUserFriend(user._id)
  );

  // Non-friends are everyone else (including search results)
  const nonFriendsList = allAvailableUsers.filter(user => 
    !isUserFriend(user._id)
  );

  const filteredUsers = searchInput ? allAvailableUsers : users.filter(user => user._id !== authUser?._id);
  const displayGroups = searchInput ? searchResults : groups;

  // Profile functions
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    
    setProfileLoading(true);

    try {
      let body = { 
        fullName: name.trim(), 
        bio: bio.trim(),
        username: username.trim() || undefined
      };

      const data = await updateProfile(body);
      if (data.success) {
        toast.success("Profile updated successfully!");
        await getUsers();
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all fields");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
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

    setProfileLoading(true);
    try {
      const data = await changePassword({ oldPassword, newPassword });
      if (data.success) {
        toast.success("Password changed successfully!");
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
      setProfileLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || 'U';
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone!")) {
      toast.error("Account deletion feature coming soon");
    }
  };

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
    
    try {
      await createGroup({ 
        name: groupName.trim(), 
        members: selectedMembers.map(m => m._id),
        description: ""
      });
      setShowGroupModal(false);
      setGroupName("");
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

  // Enhanced friend request handling
  const handleSendFriendRequest = async (userId) => {
    try {
      console.log('📤 Sidebar: Attempting to send friend request to:', userId);
      
      if (!sendFriendRequest) {
        console.error('❌ sendFriendRequest function not available');
        toast.error("Friend request feature is not available");
        return;
      }

      // Find user in multiple sources
      let targetUser = null;
      
      // First check search results (most recent)
      if (searchResults.length > 0) {
        targetUser = searchResults.find(u => u._id === userId);
      }
      
      // Then check regular users list
      if (!targetUser) {
        targetUser = users.find(u => u._id === userId);
      }
      
      // Finally check friends list
      if (!targetUser && Array.isArray(friends)) {
        targetUser = friends.find(friend => friend._id === userId);
      }

      if (!targetUser) {
        console.error('❌ User not found in any source:', userId);
        console.log('🔍 Available users:', users.length);
        console.log('🔍 Search results:', searchResults.length);
        console.log('🔍 Friends:', friends.length);
        toast.error("User not found. Please try searching again.");
        return;
      }

      console.log('✅ Found target user:', targetUser.fullName);

      // Check if we can send friend request
      if (!canSendFriendRequest(targetUser)) {
        console.log('❌ Cannot send friend request due to privacy settings');
        toast.error("Cannot send friend request to this user due to their privacy settings");
        return;
      }

      // Call the context function
      const success = await sendFriendRequest(userId);
      console.log('📡 Sidebar: sendFriendRequest result:', success);
      
      if (success) {
        toast.success("Friend request sent!");
        // Refresh data to update UI
        await getFriends();
        await getUsers();
      }
    } catch (error) {
      console.error('❌ Sidebar: Unexpected error:', error);
      toast.error(error.response?.data?.message || "An unexpected error occurred");
    }
  };

  // Enhanced friend request acceptance
  const handleAcceptFriendRequest = async (requestId) => {
    try {
      console.log('✅ Accepting friend request:', requestId);
      
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
        // Refresh data to update UI
        await getFriends();
        await getUsers();
      } else {
        toast.error("Failed to accept friend request");
      }
    } catch (error) {
      console.error('❌ Failed to accept friend request:', error);
      toast.error(error.response?.data?.message || "Failed to accept friend request");
    }
  };

  // Enhanced friend request rejection
  const handleRejectFriendRequest = async (requestId) => {
    try {
      console.log('❌ Rejecting friend request:', requestId);
      
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
        // Refresh data
        await getFriends();
        await getUsers();
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
          // Refresh friends list
          await getFriends();
          await getUsers();
        } else {
          toast.error("Failed to remove friend");
        }
      } catch (error) {
        console.error('Failed to remove friend:', error);
        toast.error("Failed to remove friend");
      }
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      logout();
    }
  };

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

  const clearSearch = () => {
    setSearchInput("");
    setSearchResults([]);
  };

  // Enhanced UserListItem with better user handling
  const UserListItem = ({ user, isOnline, isSelected, unseenCount, onSelect, showEmail = false }) => {
    const isFriend = isUserFriend(user._id);
    const hasSentRequest = hasSentFriendRequest(user._id);
    const hasReceivedRequest = hasReceivedFriendRequest(user._id);
    const requestId = getFriendRequestId(user._id);
    const canChat = isFriend && canSendMessageToUser(user);
    const canSendRequest = canSendFriendRequest(user);

    const getFriendButton = () => {
      if (isFriend) {
        return (
          <div className="flex gap-1">
            {canChat ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect(user);
                }}
                className="p-2 text-violet-400 hover:text-white hover:bg-violet-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Start chat"
              >
                <FiMessageSquare size={16} />
              </button>
            ) : (
              <button
                disabled
                className="p-2 text-gray-400 opacity-50 cursor-not-allowed"
                title="Messaging disabled"
              >
                <FiMessageSquare size={16} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveFriend(user._id);
              }}
              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
              title="Remove friend"
            >
              <FiUserX size={16} />
            </button>
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAcceptFriendRequest(requestId);
                }}
                className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Accept request"
              >
                <FiCheck size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRejectFriendRequest(requestId);
                }}
                className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
                title="Reject request"
              >
                <FiX size={16} />
              </button>
            </div>
          );
        } else {
          return (
            <button
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
            >
              <RiUserAddLine size={16} />
            </button>
          );
        }
      }
    };

    return (
      <div
        onClick={() => {
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
          isSelected && canChat
            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10' 
            : 'hover:bg-white/5 border border-transparent hover:border-white/10'
        } ${
          !isFriend || !canChat ? 'opacity-70 cursor-not-allowed' : ''
        }`}
      >
        <div className="relative flex-shrink-0">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold relative overflow-hidden border-2 ${
            isFriend && canChat 
              ? 'border-violet-400 group-hover:border-violet-300' 
              : 'border-gray-500'
          } transition-all duration-300`}>
            {user.profilePic ? (
              <img 
                src={user.profilePic} 
                alt={user.fullName} 
                className="w-full h-full object-cover"
              />
            ) : (
              getInitials(user.fullName)
            )}
          </div>
          
          {/* Status indicators */}
          <div className="absolute -bottom-1 -right-1 flex gap-1">
            {isOnline && (
              <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c2e] animate-pulse"></div>
            )}
            {isFriend && (
              <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center">
                <FiUserCheck size={8} className="text-white" />
              </div>
            )}
          </div>
        </div>
        
        {!collapsed && (
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold truncate text-white text-sm">{user.fullName}</p>
              {isFriend ? (
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
              <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'} truncate font-medium`}>
                {isOnline ? '🟢 Online' : '⚫ Offline'}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-shrink-0">
          {unseenCount > 0 && canChat && (
            <div className="flex-shrink-0">
              <div className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs text-white font-bold shadow-lg">
                {unseenCount > 99 ? '99+' : unseenCount}
              </div>
            </div>
          )}
          {!collapsed && getFriendButton()}
        </div>
      </div>
    );
  };

  const GroupListItem = ({ group, isSelected, unseenCount, onSelect }) => {
    const memberCount = group.members?.length || 0;
    const isAdmin = group.admin === authUser._id;

    return (
      <div
        onClick={() => onSelect(group)}
        className={`relative flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all duration-300 group backdrop-blur-sm ${
          isSelected 
            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 shadow-lg shadow-violet-500/10' 
            : 'hover:bg-white/5 border border-transparent hover:border-white/10'
        }`}
      >
        <div className="relative flex-shrink-0">
          {group.image ? (
            <img 
              src={group.image} 
              alt={group.name} 
              className="w-12 h-12 rounded-2xl object-cover border-2 border-violet-500/50 group-hover:border-violet-400 transition-all duration-300" 
            />
          ) : (
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg border-2 border-violet-500/50 group-hover:border-violet-400 transition-all duration-300">
              <span className="text-white font-bold text-sm">
                {group.name?.[0]?.toUpperCase() || 'G'}
              </span>
            </div>
          )}
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center shadow-lg">
              <span className="text-[8px] text-black font-bold">A</span>
            </div>
          )}
        </div>
        
        {!collapsed && (
          <div className="flex flex-col flex-1 min-w-0">
            <p className="font-semibold truncate text-white text-sm">{group.name}</p>
            <span className="text-xs text-gray-400 truncate">
              {memberCount} {memberCount === 1 ? 'member' : 'members'}
              {group.description && ` • ${group.description}`}
            </span>
          </div>
        )}

        {unseenCount > 0 && (
          <div className="flex-shrink-0">
            <div className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-gradient-to-r from-violet-500 to-purple-500 text-xs text-white font-bold shadow-lg">
              {unseenCount > 99 ? '99+' : unseenCount}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Enhanced FriendRequestItem component
  const FriendRequestItem = ({ request }) => {
    // Handle different request data structures
    const requestData = request.from || request;
    const requestId = request._id;
    
    if (!requestData) {
      console.warn('Invalid friend request data:', request);
      return null;
    }

    return (
      <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300">
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
          <button
            onClick={() => handleAcceptFriendRequest(requestId)}
            className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded-xl transition-all duration-200 hover:scale-110"
            title="Accept"
          >
            <FiCheck size={16} />
          </button>
          <button
            onClick={() => handleRejectFriendRequest(requestId)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-200 hover:scale-110"
            title="Reject"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`h-full flex flex-col text-white bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl ${
        isMobile ? 'w-full absolute inset-0 z-40' : 'w-full'
      }`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-sm">Loading your chats...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showProfile) {
    return (
      <div className={`h-full flex flex-col text-white bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl ${
        isMobile ? 'w-full absolute inset-0 z-40' : 'w-full'
      }`}>
        <div className="h-full flex flex-col bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl">
          <div className="p-6 border-b border-white/10 flex items-center gap-3">
            <button 
              onClick={handleBackToChats}
              className="text-gray-400 hover:text-white transition-all duration-300 p-2 hover:bg-white/10 rounded-xl hover:scale-105"
            >
              <FiArrowLeft size={20} />
            </button>
            <h2 className="text-xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Profile Settings</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-md mx-auto space-y-6">
              <div className="flex flex-col items-center">
                <div className="relative mb-6">
                  <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl relative overflow-hidden border-4 border-violet-500/50 shadow-2xl">
                    {authUser?.profilePic ? (
                      <img 
                        src={authUser.profilePic} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getInitials(authUser?.fullName)
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Full Name
                  </label>
                  <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white">
                    {authUser?.fullName}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Email Address
                  </label>
                  <div className="flex items-center gap-3 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-400">
                    <FiMail size={18} className="text-violet-400" />
                    <span className="text-white/80">{authUser?.email}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-white mb-3">
                    Username
                  </label>
                  <div className="p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white">
                    @{authUser?.username}
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-6 mt-6 space-y-3">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-3 text-red-400 hover:text-red-300 text-sm py-3 hover:bg-red-500/10 rounded-xl transition-all duration-300 hover:scale-[1.02]"
                >
                  <FiLogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col text-white bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-xl ${
      isMobile ? 'w-full absolute inset-0 z-40' : 'w-full'
    }`}>
      {/* Header Section */}
      <div className="p-6 pb-4 flex-shrink-0 border-b border-white/10">
        <div className="flex justify-between items-center mb-6">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-white/5 p-3 rounded-2xl transition-all duration-300 flex-1 min-w-0 group"
            onClick={handleProfileClick}
          >
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-semibold border-2 border-violet-500/50 group-hover:border-violet-400 transition-all duration-300">
                {authUser?.profilePic ? (
                  <img src={authUser.profilePic} alt="My Profile" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  getInitials(authUser?.fullName)
                )}
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c2e] animate-pulse"></div>
            </div>
            
            {!collapsed && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold truncate text-white">
                  {authUser?.fullName || 'My Profile'}
                </span>
                <span className="text-xs text-violet-300/80 truncate">View profile</span>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="flex items-center gap-2 flex-shrink-0">
              <button 
                onClick={() => setShowFriendRequests(!showFriendRequests)}
                className="relative p-3 hover:bg-white/5 rounded-xl transition-all duration-300 hover:scale-105 group"
                title="Friend Requests"
              >
                <FiBell size={18} className="text-gray-400 group-hover:text-violet-400" />
                {friendRequests.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                    <span className="text-xs text-white font-bold">
                      {friendRequests.length > 9 ? '9+' : friendRequests.length}
                    </span>
                  </div>
                )}
              </button>
              
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="p-3 hover:bg-white/5 rounded-xl transition-all duration-300 hover:scale-105 group"
                >
                  <FiMoreVertical size={18} className="text-gray-400 group-hover:text-violet-400" />
                </button>
                
                {dropdownOpen && (
                  <div 
                    className="absolute top-full right-0 z-20 w-56 p-2 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl"
                  >
                    <button 
                      onClick={handleProfileClick}
                      className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <FiUser size={16} />
                      Profile & Settings
                    </button>
                    <button 
                      onClick={() => setShowGroupModal(true)}
                      className="flex items-center gap-3 w-full p-3 text-sm text-white hover:bg-white/10 rounded-xl transition-all duration-200"
                    >
                      <RiGroupLine size={16} />
                      Create Group
                    </button>
                    <hr className="my-2 border-t border-white/10" />
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full p-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200"
                    >
                      <FiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {showFriendRequests && friendRequests.length > 0 && !collapsed && (
          <div className="mb-4 p-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold text-white">Friend Requests</h4>
              <span className="text-xs text-violet-300 bg-violet-500/10 px-2 py-1 rounded-full">{friendRequests.length} pending</span>
            </div>
            <div className="space-y-2">
              {friendRequests.map((request, index) => (
                <FriendRequestItem key={request._id || index} request={request} />
              ))}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className={`${showFriendRequests && friendRequests.length > 0 ? 'mt-4' : 'mt-2'}`}>
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
                <button 
                  onClick={clearSearch}
                  className="text-gray-400 hover:text-white transition-all duration-200 p-1 flex-shrink-0 hover:scale-110"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      {!collapsed && (
        <div className="px-6 pb-4 flex-shrink-0">
          <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1">
            <button 
              onClick={() => setActiveTab("chats")}
              className={`flex items-center justify-center flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === "chats" 
                  ? "text-white bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <FiMessageSquare size={18} className="mr-2 flex-shrink-0" /> 
              <span className="truncate">Chats</span>
            </button>
            <button 
              onClick={() => setActiveTab("groups")}
              className={`flex items-center justify-center flex-1 py-3 px-4 text-sm font-semibold transition-all duration-300 rounded-xl ${
                activeTab === "groups" 
                  ? "text-white bg-gradient-to-r from-violet-500 to-purple-500 shadow-lg" 
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              <FiUsers size={18} className="mr-2 flex-shrink-0" /> 
              <span className="truncate">Groups</span>
            </button>
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === "chats" && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <p className="text-sm mt-3">Searching users...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-3">
                  {/* Friends Section */}
                  {friendsList.length > 0 && (
                    <div>
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
                          .filter(user => canSendMessageToUser(user))
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
                    </div>
                  )}

                  {/* Non-Friends Section */}
                  {searchInput && nonFriendsList.length > 0 && !collapsed && (
                    <div>
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
                    </div>
                  )}

                  {/* Empty state */}
                  {friendsList.length === 0 && !searchInput && !collapsed && (
                    <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                        <FiUsers size={32} className="opacity-50" />
                      </div>
                      <p className="text-center text-sm font-medium">No friends yet</p>
                      <p className="text-xs mt-2 text-center text-gray-500">Add friends to start chatting</p>
                      <button 
                        onClick={() => setSearchInput("")}
                        className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                      >
                        Search for users
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                !collapsed && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4">
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
                  </div>
                )
              )}
            </div>

            {/* Create Group FAB */}
            {!collapsed && (
              <div className="p-6">
                <button 
                  onClick={() => setShowGroupModal(true)}
                  className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <FiPlus size={18} />
                  Create Group
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === "groups" && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto py-4 px-6">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <p className="text-sm mt-3">Searching groups...</p>
                </div>
              ) : displayGroups && displayGroups.length > 0 ? (
                <div className="space-y-3">
                  {displayGroups.map(group => (
                    <GroupListItem 
                      key={group._id}
                      group={group}
                      isSelected={selectedUser?._id === group._id}
                      unseenCount={unseenMessages[group._id] || 0}
                      onSelect={selectGroup}
                    />
                  ))}
                </div>
              ) : (
                !collapsed && (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/10 to-purple-500/10 flex items-center justify-center mb-4">
                      <RiGroupLine size={24} className="opacity-50" />
                    </div>
                    <p className="text-center text-sm font-medium">
                      {searchInput ? "No groups found" : "No groups yet"}
                    </p>
                    {!searchInput && (
                      <button 
                        onClick={() => setShowGroupModal(true)}
                        className="mt-4 text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors"
                      >
                        Create your first group
                      </button>
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div 
            className="bg-gradient-to-b from-slate-800/90 to-slate-900/90 backdrop-blur-xl rounded-3xl max-w-md w-full mx-auto border border-white/10 shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-8 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">Create New Group</h3>
                <button 
                  onClick={() => setShowGroupModal(false)} 
                  className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110"
                >
                  <FiX size={24} />
                </button>
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
                    Select Members ({selectedMembers.length} selected) *
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 space-y-2">
                    {users
                      .filter(u => u._id !== authUser._id)
                      .map(user => (
                      <div 
                        key={user._id} 
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-300 ${
                          selectedMembers.some(m => m._id === user._id) 
                            ? 'bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30' 
                            : 'hover:bg-white/5 border border-transparent hover:border-white/10'
                        }`}
                        onClick={() => toggleMember(user)}
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
                      </div>
                    ))}
                  </div>
                  {users.filter(u => u._id !== authUser._id).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6">
                      No users available to add to group
                    </p>
                  )}
                </div>
                
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowGroupModal(false);
                      setGroupName("");
                      setSelectedMembers([]);
                    }} 
                    className="flex-1 p-4 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-all duration-300 font-semibold hover:scale-[1.02] active:scale-95"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 p-4 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white rounded-xl transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!groupName.trim() || selectedMembers.length === 0}
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;