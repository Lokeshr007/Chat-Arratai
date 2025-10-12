import React, { useEffect, useState, useContext } from "react";
import assets from "../assets/assets";
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
  FiXCircle
} from "react-icons/fi";
import toast from "react-hot-toast";

const Sidebar = ({ isMobile, onUserSelect, selectedUser, setIsProfileOpen }) => {
  const { logout, onlineUsers, authUser, socket } = useContext(AuthContext);
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
    searchGroups,
    // Friend system functions
    friends,
    friendRequests,
    sentRequests,
    getFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend
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

  // Simple data fetching - load once when component mounts
  useEffect(() => { 
    if (authUser) {
      const loadData = async () => {
        setLoading(true);
        try {
          console.log('🔄 Loading sidebar data...');
          // Load all data sequentially
          await getUsers();
          await getFriends();
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
  }, [authUser, activeTab]);

  // Handle search with debounce
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
          results = await searchUsers(searchInput);
        } else {
          results = await searchGroups(searchInput);
        }
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(searchTimeout);
  }, [searchInput, activeTab, searchUsers, searchGroups]);

  // Filter out current user and get display data
  const filteredUsers = searchInput ? 
    searchResults.filter(user => user._id !== authUser?._id) : 
    users.filter(user => user._id !== authUser?._id);

  const displayGroups = searchInput ? searchResults : groups;

  // Separate friends and non-friends
  const friendsList = filteredUsers.filter(user => 
    Array.isArray(friends) && friends.some(friend => friend._id === user._id)
  );
  const nonFriendsList = filteredUsers.filter(user => 
    !friendsList.includes(user)
  );

  // Group create handler
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

  // User selection handler
  const selectUser = async (user) => {
    try {
      setSelectedUser(user);
      if (onUserSelect) onUserSelect(user);
      await getMessage(user._id);
      markMessagesAsSeen(user._id);
    } catch (error) {
      console.error("Error selecting user:", error);
      toast.error("Failed to load messages");
    }
  };

  // Group selection handler
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

  // Friend request handlers
  const handleSendFriendRequest = async (userId) => {
    try {
      const success = await sendFriendRequest(userId);
      if (success) {
        toast.success("Friend request sent!");
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
    }
  };

  const handleAcceptFriendRequest = async (userId) => {
    try {
      const success = await acceptFriendRequest(userId);
      if (success) {
        toast.success("Friend request accepted!");
        setShowFriendRequests(false);
      }
    } catch (error) {
      console.error('Failed to accept friend request:', error);
      toast.error("Failed to accept friend request");
    }
  };

  const handleRejectFriendRequest = async (userId) => {
    try {
      const success = await rejectFriendRequest(userId);
      if (success) {
        toast.success("Friend request rejected");
        setShowFriendRequests(false);
      }
    } catch (error) {
      console.error('Failed to reject friend request:', error);
      toast.error("Failed to reject friend request");
    }
  };

  const handleRemoveFriend = async (userId) => {
    if (window.confirm("Are you sure you want to remove this friend?")) {
      try {
        const success = await removeFriend(userId);
        if (success) {
          toast.success("Friend removed");
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
    if (setIsProfileOpen) {
      setIsProfileOpen(true);
    } else {
      navigate("/profile");
    }
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchResults([]);
  };

  // UserListItem Component with friend actions
  const UserListItem = ({ user, isOnline, isSelected, unseenCount, onSelect }) => {
    // Safe friend status checks
    const isFriend = Array.isArray(friends) && friends.some(friend => friend._id === user._id);
    const hasSentRequest = Array.isArray(sentRequests) && sentRequests.some(req => 
      req.to && req.to.toString() === user._id && req.status === 'pending'
    );
    const hasReceivedRequest = Array.isArray(friendRequests) && friendRequests.some(req => 
      req.from && req.from.toString() === user._id && req.status === 'pending'
    );

    const getFriendButton = () => {
      if (isFriend) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFriend(user._id);
            }}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
            title="Remove friend"
          >
            <FiUserX size={14} />
          </button>
        );
      } else if (hasSentRequest) {
        return (
          <button
            disabled
            className="p-1.5 text-yellow-400 opacity-50 cursor-not-allowed"
            title="Request sent"
          >
            <FiUserPlus size={14} />
          </button>
        );
      } else if (hasReceivedRequest) {
        return (
          <div className="flex gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleAcceptFriendRequest(user._id);
              }}
              className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
              title="Accept request"
            >
              <FiCheck size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleRejectFriendRequest(user._id);
              }}
              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
              title="Reject request"
            >
              <FiX size={14} />
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
            className="p-1.5 text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"
            title="Add friend"
          >
            <FiUserPlus size={14} />
          </button>
        );
      }
    };

    return (
      <div
        onClick={() => onSelect(user)}
        className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${
          isSelected 
            ? 'bg-violet-600/20 border border-violet-500/50' 
            : 'hover:bg-[#282142]/50 border border-transparent'
        }`}
      >
        <div className="relative flex-shrink-0">
          <img 
            src={user.profilePic || assets.avatar_icon} 
            alt={user.fullName} 
            className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 group-hover:border-violet-400 transition-colors" 
          />
          {isOnline && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1c1c2e]"></div>
          )}
          {isFriend && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center">
              <FiUserCheck size={8} className="text-white" />
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium truncate text-sm text-white">{user.fullName}</p>
            {isFriend && (
              <span className="text-xs text-blue-400 font-medium">Friend</span>
            )}
            {hasSentRequest && (
              <span className="text-xs text-yellow-400 font-medium">Request Sent</span>
            )}
            {hasReceivedRequest && (
              <span className="text-xs text-green-400 font-medium">Request Received</span>
            )}
          </div>
          <span className={`text-xs ${isOnline ? 'text-green-400' : 'text-gray-400'} truncate`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {unseenCount > 0 && (
            <div className="flex-shrink-0">
              <div className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-violet-500 text-xs text-white font-bold">
                {unseenCount > 99 ? '99+' : unseenCount}
              </div>
            </div>
          )}
          {getFriendButton()}
        </div>
      </div>
    );
  };

  // GroupListItem Component
  const GroupListItem = ({ group, isSelected, unseenCount, onSelect }) => {
    const memberCount = group.members?.length || 0;
    const isAdmin = group.admin === authUser._id;

    return (
      <div
        onClick={() => onSelect(group)}
        className={`relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group mb-2 ${
          isSelected 
            ? 'bg-violet-600/20 border border-violet-500/50' 
            : 'hover:bg-[#282142]/50 border border-transparent'
        }`}
      >
        <div className="relative flex-shrink-0">
          {group.image ? (
            <img 
              src={group.image} 
              alt={group.name} 
              className="w-12 h-12 rounded-full object-cover border-2 border-gray-600 group-hover:border-violet-400 transition-colors" 
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg border-2 border-gray-600 group-hover:border-violet-400 transition-colors">
              <span className="text-white font-bold text-sm">
                {group.name?.[0]?.toUpperCase() || 'G'}
              </span>
            </div>
          )}
          {isAdmin && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full border-2 border-[#1c1c2e] flex items-center justify-center">
              <span className="text-[8px] text-black font-bold">A</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <p className="font-medium truncate text-sm text-white">{group.name}</p>
          <span className="text-xs text-gray-400 truncate">
            {memberCount} {memberCount === 1 ? 'member' : 'members'}
            {group.description && ` • ${group.description}`}
          </span>
        </div>

        {unseenCount > 0 && (
          <div className="flex-shrink-0">
            <div className="h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full bg-violet-500 text-xs text-white font-bold">
              {unseenCount > 99 ? '99+' : unseenCount}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Friend Request Item Component
  const FriendRequestItem = ({ request }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#282142]/50 border border-gray-600/50">
      <img 
        src={request.profilePic || assets.avatar_icon} 
        alt={request.fullName} 
        className="w-10 h-10 rounded-full object-cover border-2 border-gray-600" 
      />
      <div className="flex flex-col flex-1 min-w-0">
        <p className="font-medium text-sm text-white truncate">{request.fullName}</p>
        <span className="text-xs text-gray-400">Wants to be your friend</span>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => handleAcceptFriendRequest(request._id)}
          className="p-2 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-lg transition-colors"
          title="Accept"
        >
          <FiCheck size={16} />
        </button>
        <button
          onClick={() => handleRejectFriendRequest(request._id)}
          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
          title="Reject"
        >
          <FiX size={16} />
        </button>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className={`bg-[#1c1c2e] h-full flex flex-col text-white ${
        isMobile ? 'w-full absolute inset-0 z-40' : 'w-full border-r border-gray-700'
      }`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading chats...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#1c1c2e] h-full flex flex-col text-white ${
      isMobile ? 'w-full absolute inset-0 z-40' : 'w-full border-r border-gray-700'
    }`}>
      {/* Header */}
      <div className="p-4 pb-3 flex-shrink-0 bg-[#1c1c2e] border-b border-gray-700">
        <div className="flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-[#282142]/30 p-2 rounded-lg transition-colors flex-1 min-w-0"
            onClick={handleProfileClick}
          >
            <img 
              src={authUser?.profilePic || assets.avatar_icon} 
              alt="My Profile" 
              className="w-10 h-10 rounded-full object-cover border-2 border-violet-500/50 flex-shrink-0" 
            />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium truncate text-white">
                {authUser?.fullName || 'My Profile'}
              </span>
              <span className="text-xs text-gray-400 truncate">View profile</span>
            </div>
          </div>
          
          {/* Friend Requests & Menu Dropdown */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Friend Requests Button */}
            <button 
              onClick={() => setShowFriendRequests(!showFriendRequests)}
              className="relative p-2 hover:bg-[#282142]/30 rounded-lg transition-colors"
              title="Friend Requests"
            >
              <FiBell size={18} />
              {Array.isArray(friendRequests) && friendRequests.length > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">
                    {friendRequests.length > 9 ? '9+' : friendRequests.length}
                  </span>
                </div>
              )}
            </button>
            
            {/* Menu Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="p-2 hover:bg-[#282142]/30 rounded-lg transition-colors"
              >
                <img src={assets.menu_icon} alt="Menu" className="w-5 h-5" />
              </button>
              
              {dropdownOpen && (
                <div 
                  className="absolute top-full right-0 z-20 w-48 p-3 rounded-lg bg-[#282142] border border-gray-600 shadow-xl backdrop-blur-sm"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <button 
                    onClick={handleProfileClick}
                    className="flex items-center gap-2 w-full p-2 text-sm hover:text-violet-400 transition-colors text-left"
                  >
                    <FiSettings size={16} />
                    Settings & Profile
                  </button>
                  <hr className="my-2 border-t border-gray-500" />
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full p-2 text-sm hover:text-red-400 transition-colors text-left"
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Friend Requests Dropdown */}
        {showFriendRequests && Array.isArray(friendRequests) && friendRequests.length > 0 && (
          <div className="mt-3 p-3 bg-[#282142] rounded-xl border border-gray-600/50 max-h-60 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-white">Friend Requests</h4>
              <span className="text-xs text-gray-400">{friendRequests.length} pending</span>
            </div>
            <div className="space-y-2">
              {friendRequests.map(request => (
                <FriendRequestItem key={request._id} request={request} />
              ))}
            </div>
          </div>
        )}

        {/* Search + Group Create Button */}
        <div className={`mt-${showFriendRequests && friendRequests.length > 0 ? '3' : '4'}`}>
          <div className="bg-[#282142] rounded-xl flex items-center gap-2 py-2 px-3 border border-gray-600/50 focus-within:border-violet-500/50 transition-colors">
            <FiSearch className="w-4 h-4 opacity-70 flex-shrink-0" />
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
                className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
              >
                <FiX size={16} />
              </button>
            )}
            <button 
              onClick={() => setShowGroupModal(true)}
              className="flex items-center gap-1 text-violet-400 hover:text-violet-300 text-sm transition-colors p-2 hover:bg-violet-500/10 rounded-lg flex-shrink-0"
              title="Create new group"
            >
              <FiPlus size={16} />
              <span className="hidden sm:inline">Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs for Chats/Groups */}
      <div className="px-4 pb-2 flex-shrink-0 bg-[#1c1c2e]">
        <div className="flex bg-[#282142] rounded-lg p-1">
          <button 
            onClick={() => setActiveTab("chats")}
            className={`flex items-center justify-center flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
              activeTab === "chats" 
                ? "text-white bg-violet-600 shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-[#333366]"
            }`}
          >
            <FiMessageSquare size={16} className="mr-2 flex-shrink-0" /> 
            <span className="truncate">Chats</span>
          </button>
          <button 
            onClick={() => setActiveTab("groups")}
            className={`flex items-center justify-center flex-1 py-2 px-3 text-sm font-medium transition-all rounded-md ${
              activeTab === "groups" 
                ? "text-white bg-violet-600 shadow-lg" 
                : "text-gray-400 hover:text-white hover:bg-[#333366]"
            }`}
          >
            <FiUsers size={16} className="mr-2 flex-shrink-0" /> 
            <span className="truncate">Groups</span>
          </button>
        </div>
      </div>

      {/* Content based on tab */}
      <div className="flex-1 overflow-hidden flex flex-col bg-[#14142b]">
        {activeTab === "chats" && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto py-2 px-4">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <p className="text-sm mt-2">Searching...</p>
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  {/* Friends Section */}
                  {friendsList.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <FiUserCheck size={16} className="text-blue-400" />
                        <span className="text-xs font-medium text-blue-400">Friends ({friendsList.length})</span>
                      </div>
                      <div className="space-y-2">
                        {friendsList.map(user => (
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

                  {/* Other Users Section */}
                  {nonFriendsList.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-2 px-2">
                        <FiUsers size={16} className="text-gray-400" />
                        <span className="text-xs font-medium text-gray-400">Other Users ({nonFriendsList.length})</span>
                      </div>
                      <div className="space-y-2">
                        {nonFriendsList.map(user => (
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
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4">
                  <FiUsers size={48} className="mb-3 opacity-50" />
                  <p className="text-center text-sm">
                    {searchInput ? "No users found" : "No users available"}
                  </p>
                  {searchInput ? (
                    <p className="text-xs mt-1 text-center">Try adjusting your search terms</p>
                  ) : (
                    <p className="text-xs mt-1 text-center">Start chatting by selecting a user</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "groups" && (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto py-2 px-4">
              {isSearching ? (
                <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
                  <p className="text-sm mt-2">Searching groups...</p>
                </div>
              ) : displayGroups && displayGroups.length > 0 ? (
                <div className="space-y-2">
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
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-8 px-4">
                  <FiUsers size={48} className="mb-3 opacity-50" />
                  <p className="text-center text-sm">
                    {searchInput ? "No groups found" : "No groups yet"}
                  </p>
                  {!searchInput && (
                    <button 
                      onClick={() => setShowGroupModal(true)}
                      className="mt-3 text-violet-400 hover:text-violet-300 text-sm transition-colors"
                    >
                      Create your first group
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Group Create Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div 
            className="bg-[#1c1c2e] rounded-2xl max-w-md w-full mx-auto border border-gray-600/50 shadow-2xl max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center gap-3 mb-6">
                {isMobile && (
                  <button 
                    onClick={() => setShowGroupModal(false)} 
                    className="text-gray-400 hover:text-white p-2 hover:bg-[#282142] rounded-lg transition-colors"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                )}
                <h3 className="text-xl font-semibold text-white flex-1">Create New Group</h3>
                {!isMobile && (
                  <button 
                    onClick={() => setShowGroupModal(false)} 
                    className="text-gray-400 hover:text-white p-2 hover:bg-[#282142] rounded-lg transition-colors"
                  >
                    <FiX size={20} />
                  </button>
                )}
              </div>
              
              <form onSubmit={handleCreateGroup}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter group name..."
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    className="w-full p-3 bg-[#282142] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors"
                    required
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-400 mt-1">{groupName.length}/50 characters</p>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Group description..."
                    rows="2"
                    className="w-full p-3 bg-[#282142] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Select Members ({selectedMembers.length} selected) *
                  </label>
                  <div className="max-h-48 overflow-y-auto bg-[#282142] border border-gray-600 rounded-lg p-3">
                    {users
                      .filter(u => u._id !== authUser._id)
                      .map(user => (
                      <div 
                        key={user._id} 
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors mb-2 last:mb-0 ${
                          selectedMembers.some(m => m._id === user._id) 
                            ? 'bg-violet-500/20 border border-violet-500/50' 
                            : 'hover:bg-[#333366] border border-transparent'
                        }`}
                        onClick={() => toggleMember(user)}
                      >
                        <input 
                          type="checkbox" 
                          checked={selectedMembers.some(m => m._id === user._id)} 
                          onChange={() => {}} // Read-only, handled by div click
                          className="w-4 h-4 text-violet-600 rounded focus:ring-violet-500 flex-shrink-0"
                        />
                        <img 
                          src={user.profilePic || assets.avatar_icon} 
                          alt="" 
                          className="w-8 h-8 rounded-full flex-shrink-0" 
                        />
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm text-white truncate">{user.fullName}</span>
                          <span className="text-xs text-gray-400 truncate">
                            {onlineUsers.includes(user._id) ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  {users.filter(u => u._id !== authUser._id).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">
                      No users available to add to group
                    </p>
                  )}
                </div>
                
                <div className="flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowGroupModal(false);
                      setGroupName("");
                      setSelectedMembers([]);
                    }} 
                    className="flex-1 p-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 p-3 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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