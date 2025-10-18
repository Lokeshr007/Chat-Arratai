import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from "react";
import PropTypes from 'prop-types';
import { toast } from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [trendingChats, setTrendingChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState({});
  const [reactions, setReactions] = useState({});
  const [messageReplies, setMessageReplies] = useState({});
  const [forwardedMessages, setForwardedMessages] = useState([]);
  const [pagination, setPagination] = useState({});
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [chatMedia, setChatMedia] = useState([]);
  const [sharedLinks, setSharedLinks] = useState([]);
  const [sharedDocs, setSharedDocs] = useState([]);
  const [sharedLocations, setSharedLocations] = useState([]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [recentChats, setRecentChats] = useState([]);
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [chatSettings, setChatSettings] = useState({});
  const [favorites, setFavorites] = useState([]);
  
  // Friend system states
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  const { socket, api, authUser, onlineUsers } = useContext(AuthContext);
  
  const typingTimeoutRef = useRef(null);
  const currentChatIdRef = useRef(null);
  const abortControllerRef = useRef(null);
  const prevSelectedUserRef = useRef(null);
  const pendingMessagesRef = useRef(new Map());
  const messageCacheRef = useRef(new Map());
  const isGroup = selectedGroup;

  // ========== UTILITY FUNCTIONS ==========
  
  const getFileType = (url) => {
    if (!url || typeof url !== 'string') return 'other';
    
    const extension = url.split('.').pop()?.toLowerCase() || '';
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    const docExtensions = ['pdf', 'doc', 'docx', 'txt', 'zip', 'rar', 'xls', 'xlsx', 'ppt', 'pptx'];
    const audioExtensions = ['mp3', 'wav', 'ogg', 'm4a'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv'];
    
    if (imageExtensions.includes(extension)) return 'image';
    if (docExtensions.includes(extension)) return 'document';
    if (audioExtensions.includes(extension)) return 'audio';
    if (videoExtensions.includes(extension)) return 'video';
    return 'other';
  };

  const getFileIcon = (filename) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return '📄';
      case 'doc':
      case 'docx':
        return '📝';
      case 'xls':
      case 'xlsx':
        return '📊';
      case 'zip':
      case 'rar':
        return '📦';
      case 'txt':
        return '📃';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return '🎵';
      case 'mp4':
      case 'avi':
      case 'mov':
        return '🎥';
      default:
        return '📎';
    }
  };

  const downloadFile = async (url, filename) => {
    try {
      toast.loading('Downloading file...');
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.dismiss();
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Download error:', error);
      toast.dismiss();
      toast.error('Failed to download file');
    }
  };

  // ========== CACHE FUNCTIONS ==========

  const getCachedMessages = useCallback((chatId) => {
    if (!chatId) return null;
    
    const memoryCache = messageCacheRef.current.get(`chat-${chatId}`);
    if (memoryCache) {
      console.log('📦 Using memory cached messages:', memoryCache.length);
      return memoryCache;
    }
    
    try {
      const stored = localStorage.getItem(`chat-messages-${chatId}`);
      if (stored) {
        const parsedMessages = JSON.parse(stored);
        console.log('💾 Using localStorage cached messages:', parsedMessages.length);
        messageCacheRef.current.set(`chat-${chatId}`, parsedMessages);
        return parsedMessages;
      }
    } catch (error) {
      console.error('Error reading from localStorage:', error);
    }
    
    return null;
  }, []);

  const setCachedMessages = useCallback((chatId, messages) => {
    if (!chatId || !messages) return;
    
    messageCacheRef.current.set(`chat-${chatId}`, messages);
    
    try {
      localStorage.setItem(`chat-messages-${chatId}`, JSON.stringify(messages));
      console.log('💾 Saved messages to cache:', messages.length);
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, []);

  const clearCachedMessages = useCallback((chatId) => {
    if (!chatId) return;
    
    messageCacheRef.current.delete(`chat-${chatId}`);
    
    try {
      localStorage.removeItem(`chat-messages-${chatId}`);
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }, []);

  // ========== PRIVACY & HELPER FUNCTIONS ==========

  const canViewUserProfile = useCallback((user) => {
    if (!user) return false;
    if (user._id === authUser?._id) return true;
    
    const privacy = user.privacySettings || {};
    
    switch (privacy.profileVisibility) {
      case 'public':
        return true;
      case 'friends':
        return friends.some(friend => friend._id === user._id);
      case 'private':
        return false;
      default:
        return friends.some(friend => friend._id === user._id);
    }
  }, [authUser?._id, friends]);

  const canSendMessageToUser = useCallback((user) => {
    if (!user) return false;
    if (user._id === authUser?._id) return false;
    
    const privacy = user.privacySettings || {};
    
    if (user.blockedUsers?.includes(authUser?._id)) return false;
    
    const isFriend = friends.some(friend => friend._id === user._id);
    const hasPendingRequest = sentRequests.some(req => 
      (req.to?._id === user._id || req.to === user._id) && req.status === 'pending'
    ) || friendRequests.some(req => 
      (req.from?._id === user._id || req.from === user._id) && req.status === 'pending'
    );
    
    if (!isFriend && !hasPendingRequest) return false;
    
    switch (privacy.messageReceiving) {
      case 'everyone':
        return true;
      case 'friends':
        return isFriend;
      case 'nobody':
        return false;
      default:
        return isFriend;
    }
  }, [authUser, friends, sentRequests, friendRequests]);

  const canSendFriendRequest = useCallback((user) => {
    if (!user) {
      console.log('❌ canSendFriendRequest: No user provided');
      return false;
    }
    if (user._id === authUser?._id) {
      console.log('❌ canSendFriendRequest: Cannot send to self');
      return false;
    }
    
    const privacy = user.privacySettings || {};
    const isFriend = friends.some(friend => friend._id === user._id);
    
    console.log('🔍 canSendFriendRequest debug:');
    console.log('  - User:', user.fullName);
    console.log('  - Is friend:', isFriend);
    console.log('  - Privacy settings:', privacy);
    console.log('  - Friend requests setting:', privacy.friendRequests);
    
    if (isFriend) {
      console.log('❌ canSendFriendRequest: Already friends');
      return false;
    }
    
    const hasPendingRequest = sentRequests.some(req => {
      const toUserId = req.to?._id || req.to;
      return toUserId === user._id && req.status === 'pending';
    });
    
    if (hasPendingRequest) {
      console.log('❌ canSendFriendRequest: Request already sent');
      return false;
    }
    
    const hasReceivedRequest = friendRequests.some(req => {
      const fromUserId = req.from?._id || req.from;
      return fromUserId === user._id && req.status === 'pending';
    });
    
    if (hasReceivedRequest) {
      console.log('❌ canSendFriendRequest: Request already received');
      return false;
    }
    
    switch (privacy.friendRequests) {
      case 'everyone':
        console.log('✅ canSendFriendRequest: Everyone allowed');
        return true;
      case 'friends_of_friends':
        const mutualFriends = friends.some(friend1 => 
          user.friends?.some(friend2 => friend1._id === friend2._id)
        );
        console.log('🔍 canSendFriendRequest: Friends of friends - mutual friends:', mutualFriends);
        return mutualFriends;
      case 'nobody':
        console.log('❌ canSendFriendRequest: Nobody allowed');
        return false;
      default:
        console.log('✅ canSendFriendRequest: Default case - allowing');
        return true;
    }
  }, [authUser, friends, sentRequests, friendRequests]);

  // ========== SEARCH & HISTORY MANAGEMENT ==========

  const addToSearchHistory = useCallback((query, results = []) => {
    if (!query.trim()) return;
    
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item.query.toLowerCase() !== query.toLowerCase());
      const newItem = {
        query,
        timestamp: Date.now(),
        resultCount: results.length
      };
      return [newItem, ...filtered].slice(0, 10);
    });
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const addToRecentChats = useCallback((chat) => {
    if (!chat) return;
    
    setRecentChats(prev => {
      const filtered = prev.filter(item => item._id !== chat._id);
      const newItem = {
        ...chat,
        lastOpened: Date.now()
      };
      return [newItem, ...filtered].slice(0, 20);
    });
  }, []);

  const removeFromRecentChats = useCallback((chatId) => {
    setRecentChats(prev => prev.filter(chat => chat._id !== chatId));
  }, []);

  const clearRecentChats = useCallback(() => {
    setRecentChats([]);
  }, []);

  // ========== USER MANAGEMENT ==========

  const getUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/api/messages/users");
      if (data.success) {
        setUsers(data.users || []);
        setUnseenMessages(data.unseenMessages || {});
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error("Get users error:", error);
      toast.error("Failed to load users");
    }
  }, [api]);

  const searchUsers = useCallback(async (query) => {
    try {
      const { data } = await api.get(`/api/users/search?query=${encodeURIComponent(query)}`);
      if (data.success) {
        return data.users
          .map(user => ({
            ...user,
            isOnline: onlineUsers.includes(user._id),
            isFriend: friends.some(friend => friend._id === user._id),
            hasPendingRequest: sentRequests.some(req => req.to === user._id && req.status === 'pending'),
            hasReceivedRequest: friendRequests.some(req => req.from === user._id && req.status === 'pending'),
            canViewProfile: canViewUserProfile(user),
            canSendMessage: canSendMessageToUser(user),
            canSendFriendRequest: canSendFriendRequest(user)
          }))
          .filter(user => user.canViewProfile || user.canSendFriendRequest);
      }
      return [];
    } catch (error) {
      console.error("Search users error:", error);
      return [];
    }
  }, [api, onlineUsers, friends, sentRequests, friendRequests, canViewUserProfile, canSendMessageToUser, canSendFriendRequest]);

  const searchUsersByEmail = useCallback(async (email) => {
    try {
      const { data } = await api.get(`/api/users/search/email?email=${encodeURIComponent(email)}`);
      if (data.success) {
        addToSearchHistory(email, data.users);
        
        return data.users
          .map(user => ({
            ...user,
            isOnline: onlineUsers.includes(user._id),
            isFriend: friends.some(friend => friend._id === user._id),
            hasPendingRequest: sentRequests.some(req => req.to === user._id && req.status === 'pending'),
            hasReceivedRequest: friendRequests.some(req => req.from === user._id && req.status === 'pending'),
            canViewProfile: canViewUserProfile(user),
            canSendMessage: canSendMessageToUser(user),
            canSendFriendRequest: canSendFriendRequest(user)
          }))
          .filter(user => user.canViewProfile);
      }
      return [];
    } catch (error) {
      console.error("Search users by email error:", error);
      const localResults = users.filter(user => 
        user._id !== authUser?._id && 
        user.email?.toLowerCase().includes(email.toLowerCase())
      );
      addToSearchHistory(email, localResults);
      return localResults;
    }
  }, [api, onlineUsers, friends, sentRequests, friendRequests, users, authUser, canViewUserProfile, canSendMessageToUser, canSendFriendRequest, addToSearchHistory]);

  const enhancedSearchUsers = useCallback(async (query) => {
    if (!query.trim()) return [];
    
    try {
      const [nameResults, emailResults] = await Promise.all([
        searchUsers(query),
        searchUsersByEmail(query)
      ]);
      
      const combinedResults = [...nameResults, ...emailResults];
      const uniqueResults = combinedResults.filter((user, index, self) => 
        index === self.findIndex(u => u._id === user._id)
      );
      
      return uniqueResults;
    } catch (error) {
      console.error("Enhanced search error:", error);
      return [];
    }
  }, [searchUsers, searchUsersByEmail]);

  // ========== FAVORITES MANAGEMENT ==========

  const addFavorite = useCallback(async (chatId, type = 'user') => {
    try {
      const { data } = await api.post('/api/favorites/add', { chatId, type });
      if (data.success) {
        setFavorites(prev => [...prev, data.favorite]);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Add favorite error:", error);
      return false;
    }
  }, [api]);

  const removeFavorite = useCallback(async (chatId) => {
    try {
      const { data } = await api.delete(`/api/favorites/remove/${chatId}`);
      if (data.success) {
        setFavorites(prev => prev.filter(fav => fav.chatId !== chatId));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Remove favorite error:", error);
      return false;
    }
  }, [api]);

  const getFavorites = useCallback(async () => {
    try {
      const { data } = await api.get('/api/favorites');
      if (data.success) {
        setFavorites(data.favorites || []);
        return data.favorites;
      }
      return [];
    } catch (error) {
      console.error("Get favorites error:", error);
      return [];
    }
  }, [api]);

  // ========== FRIEND SYSTEM ==========

  const getFriends = useCallback(async (retryCount = 0) => {
    if (!authUser || !api) return;
    
    try {
      console.log('📞 Fetching friends...');
      const { data } = await api.get("/api/users/friends");
      
      if (data.success) {
        console.log('✅ Friends loaded:', data.friends?.length || 0);
        console.log('📥 Friend requests:', data.pendingRequests?.length || 0);
        console.log('📤 Sent requests:', data.sentRequests?.length || 0);
        
        setFriends(data.friends || []);
        setFriendRequests(data.pendingRequests || []);
        setSentRequests(data.sentRequests || []);
        return data.friends;
      } else {
        throw new Error(data.message || 'Failed to load friends');
      }
    } catch (error) {
      console.error("❌ Get friends error:", error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying friends fetch (${retryCount + 1}/2)...`);
        setTimeout(() => getFriends(retryCount + 1), 1000 * (retryCount + 1));
      } else {
        console.warn('⚠️ Using empty friends list as fallback');
        setFriends([]);
        setFriendRequests([]);
        setSentRequests([]);
        toast.error("Failed to load friends list");
      }
      return [];
    }
  }, [api, authUser]);

  const sendFriendRequest = useCallback(async (userId) => {
    try {
      console.log('🎯 ChatContext: sendFriendRequest called with userId:', userId);
      
      // Check if already friends
      const isAlreadyFriend = friends.some(friend => friend._id === userId);
      if (isAlreadyFriend) {
        console.log('❌ Already friends with this user');
        toast.error("You are already friends with this user");
        return false;
      }

      // Check if request already sent
      const hasPendingRequest = sentRequests.some(req => {
        const toUserId = req.to?._id || req.to;
        return toUserId === userId && req.status === 'pending';
      });
      
      if (hasPendingRequest) {
        console.log('❌ Friend request already sent');
        toast.error("Friend request already sent");
        return false;
      }

      // Check if request already received
      const hasReceivedRequest = friendRequests.some(req => {
        const fromUserId = req.from?._id || req.from;
        return fromUserId === userId && req.status === 'pending';
      });

      if (hasReceivedRequest) {
        console.log('❌ This user has already sent you a friend request');
        toast.error("This user has already sent you a friend request");
        return false;
      }

      console.log('📤 Sending friend request to:', userId);
      
      // Enhanced API call with better error handling
      try {
        const { data } = await api.post(`/api/users/friend-request/${userId}`);
        
        if (data.success) {
          console.log('✅ Friend request sent successfully');
          toast.success("Friend request sent successfully");
          // Refresh friends data
          await getFriends();
          await getUsers();
          return true;
        } else {
          console.log('❌ Backend returned success: false', data.message);
          toast.error(data.message);
          return false;
        }
      } catch (apiError) {
        console.error("❌ API call failed:", apiError);
        if (apiError.response) {
          console.error("❌ Response status:", apiError.response.status);
          console.error("❌ Response data:", apiError.response.data);
          if (apiError.response.status === 500) {
            toast.error("Server error: Please try again later");
          } else {
            toast.error(apiError.response.data?.message || "Failed to send friend request");
          }
        } else {
          toast.error("Network error: Please check your connection");
        }
        return false;
      }
    } catch (error) {
      console.error("❌ Send friend request error:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Failed to send friend request");
      return false;
    }
  }, [api, getFriends, getUsers, friends, sentRequests, friendRequests]);

  const acceptFriendRequest = useCallback(async (requestId) => {
    try {
      console.log('✅ Accepting friend request:', requestId);
      
      if (!requestId) {
        toast.error("Invalid friend request");
        return false;
      }

      const { data } = await api.put(`/api/users/friend-request/accept/${requestId}`);
      if (data.success) {
        toast.success("Friend request accepted!");
        await getFriends();
        await getUsers();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Accept friend request error:", error);
      toast.error(error.response?.data?.message || "Failed to accept friend request");
      return false;
    }
  }, [api, getFriends, getUsers]);

  const rejectFriendRequest = useCallback(async (requestId) => {
    try {
      console.log('❌ Rejecting friend request:', requestId);
      
      if (!requestId) {
        toast.error("Invalid friend request");
        return false;
      }

      const { data } = await api.put(`/api/users/friend-request/reject/${requestId}`);
      if (data.success) {
        toast.success("Friend request rejected");
        await getFriends();
        await getUsers();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Reject friend request error:", error);
      toast.error(error.response?.data?.message || "Failed to reject friend request");
      return false;
    }
  }, [api, getFriends, getUsers]);

  const removeFriend = useCallback(async (userId) => {
    try {
      const { data } = await api.delete(`/api/users/friend/${userId}`);
      if (data.success) {
        toast.success("Friend removed successfully");
        await getFriends();
        await getUsers();
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("❌ Remove friend error:", error);
      toast.error(error.response?.data?.message || "Failed to remove friend");
      return false;
    }
  }, [api, getFriends, getUsers]);

  // ========== GROUP MANAGEMENT ==========

  const getMyGroups = useCallback(async (retryCount = 0) => {
    if (!authUser) return;
    
    try {
      console.log('📞 Fetching groups...');
      const { data } = await api.get("/api/groups");
      if (data.success) {
        setGroups(data.groups || []);
        console.log('✅ Groups loaded:', data.groups?.length || 0);
      }
    } catch (error) {
      console.error("Get groups error:", error);
      
      if (retryCount < 3) {
        console.log(`🔄 Retrying groups fetch (${retryCount + 1}/3)...`);
        setTimeout(() => getMyGroups(retryCount + 1), 1000 * (retryCount + 1));
      }
    }
  }, [api, authUser]);

  const createGroup = async (groupData) => {
    try {
      const { data } = await api.post("/api/groups/create", groupData);
      if (data.success) {
        await getMyGroups();
        
        if (socket) {
          socket.emit("joinGroup", data.group._id);
        }
        
        toast.success("Group created successfully");
        return data.group;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error.response?.data?.message || "Failed to create group");
      return null;
    }
  };

  const addMemberToGroup = async (groupId, memberIds) => {
    try {
      const { data } = await api.post(`/api/groups/${groupId}/add`, { memberIds });
      if (data.success) {
        await getMyGroups();
        
        if (socket) {
          socket.emit("userJoinedGroup", {
            groupId,
            userId: memberIds[0],
            userName: authUser?.fullName
          });
        }
        
        toast.success("Members added successfully");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Add member error:", error);
      toast.error(error.response?.data?.message || "Failed to add member");
      return false;
    }
  };

  const removeMemberFromGroup = async (groupId, memberId) => {
    try {
      const { data } = await api.delete(`/api/groups/${groupId}/remove/${memberId}`);
      if (data.success) {
        await getMyGroups();
        
        if (socket) {
          socket.emit("userLeftGroup", {
            groupId,
            userId: memberId,
            userName: authUser?.fullName
          });
        }

        if (memberId === authUser?._id) {
          if (socket) {
            socket.emit("leaveGroup", groupId);
          }
          setSelectedGroup(null);
        }
        
        toast.success("Member removed successfully");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Remove member error:", error);
      toast.error(error.response?.data?.message || "Failed to remove member");
      return false;
    }
  };

  const leaveGroup = async (groupId) => {
    try {
      console.log(`🔄 Leaving group: ${groupId}`);
      
      const response = await api.post(`/api/groups/${groupId}/leave`);
      
      if (response.data.success) {
        // Remove group from local state
        setGroups(prev => prev.filter(group => group._id !== groupId));
        
        // If the current selected group is this group, clear selection
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(null);
        }
        
        // Remove group messages from local state
        setMessages(prev => prev.filter(msg => msg.receiverId !== groupId));
        
        // Remove from unseen messages
        setUnseenMessages(prev => {
          const newUnseen = { ...prev };
          delete newUnseen[groupId];
          return newUnseen;
        });
        
        // Emit socket event
        if (socket) {
          socket.emit('leaveGroup', groupId);
        }
        
        toast.success("Successfully left the group");
        return true;
      } else {
        throw new Error(response.data.message || "Failed to leave group");
      }
    } catch (error) {
      console.error("❌ Leave group error:", error);
      
      let errorMessage = "Failed to leave group";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Specific handling for admin cannot leave case
      if (errorMessage.includes('admin cannot leave')) {
        errorMessage = "Group admin cannot leave. Transfer admin rights first or delete the group.";
      }
      
      toast.error(errorMessage);
      return false;
    }
  };

  const updateGroupInfo = async (groupId, updateData) => {
    try {
      const { data } = await api.put(`/api/groups/${groupId}`, updateData);
      if (data.success) {
        await getMyGroups();
        
        if (socket) {
          socket.emit("groupUpdated", {
            group: data.group,
            updatedBy: authUser._id
          });
        }
        
        if (selectedGroup?._id === groupId) {
          setSelectedGroup(data.group);
        }
        
        toast.success("Group updated successfully");
        return data.group;
      } else {
        toast.error(data.message);
        return null;
      }
    } catch (error) {
      console.error("Update group error:", error);
      toast.error(error.response?.data?.message || "Failed to update group");
      return null;
    }
  };

  const searchGroups = useCallback(async (query) => {
    try {
      const { data } = await api.get(`/api/groups/search?query=${encodeURIComponent(query)}`);
      return data.success ? data.groups : [];
    } catch (error) {
      console.error("Search groups error:", error);
      return [];
    }
  }, [api]);

  // ========== MESSAGE MANAGEMENT ==========

  const getMessage = useCallback(async (chatId, page = 1, forceRefresh = false) => {
    if (!chatId) {
      console.log('❌ No chatId provided to getMessage');
      return;
    }
    
    if (currentChatIdRef.current === chatId && page === 1 && !forceRefresh) {
      console.log('🔄 Skipping duplicate message load for same chat');
      return;
    }
    
    currentChatIdRef.current = chatId;

    if (abortControllerRef.current) {
      console.log('🛑 Cancelling previous message request');
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setIsLoadingMessages(true);
      
      const isGroupChat = groups.some(group => group._id === chatId) || selectedGroup;
      const endpoint = isGroupChat 
        ? `/api/groups/${chatId}/messages`
        : `/api/messages/${chatId}`;

      console.log(`📡 Fetching messages from: ${endpoint} (page: ${page})`);
      
      const { data } = await api.get(`${endpoint}?page=${page}&limit=50`, {
        signal: abortControllerRef.current.signal,
        timeout: 10000
      });
      
      if (data.success) {
        const msgs = data.messages.map(msg => ({
          ...msg,
          status: msg.senderId?._id === authUser._id || msg.senderId === authUser._id 
            ? (msg.seen ? "seen" : "delivered") 
            : undefined
        }));
        
        console.log(`✅ Loaded ${msgs.length} messages for chat ${chatId}`);
        
        if ((selectedUser?._id === chatId || selectedGroup?._id === chatId)) {
          if (page === 1) {
            setMessages(msgs);
            setCachedMessages(chatId, msgs);
          } else {
            setMessages(prev => [...msgs, ...prev]);
          }
          setPagination(data.pagination || {});
        }
        
        return msgs;
      }
    } catch (error) {
      if (error.name !== 'AbortError' && error.code !== 'ERR_CANCELED') {
        console.error("Get messages error:", error);
        
        if (error.response?.status === 404) {
          toast.error("Chat not found");
        } else if (error.response?.status === 403) {
          toast.error("You don't have permission to view this chat");
        } else if (error.code === 'NETWORK_ERROR' || !navigator.onLine) {
          toast.error("Network error: Please check your connection");
        } else {
          toast.error("Failed to load messages");
        }
      } else {
        console.log('ℹ️ Message request was cancelled (expected behavior)');
      }
    } finally {
      if (selectedUser?._id === chatId || selectedGroup?._id === chatId) {
        setIsLoadingMessages(false);
      }
    }
  }, [api, authUser, groups, selectedUser, selectedGroup, setCachedMessages]);

  const sendMessage = async (messageData) => {
    if (!selectedUser) {
      toast.error("No user selected");
      return;
    }

    if (!canSendMessageToUser(selectedUser)) {
      if (!friends.some(friend => friend._id === selectedUser._id)) {
        toast.error("You can only message friends. Send a friend request first!");
      } else {
        toast.error("This user is not accepting messages from friends");
      }
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let fileType = 'other';
    if (messageData.mediaUrls && messageData.mediaUrls.length > 0) {
      fileType = messageData.fileType || 'other';
    }

    const tempMessage = {
      _id: tempId,
      senderId: authUser,
      receiverId: selectedUser._id,
      receiverType: 'User',
      text: messageData.text || "",
      media: messageData.mediaUrls || [],
      fileType: fileType,
      emojis: messageData.emojis || [],
      replyTo: messageData.replyTo,
      createdAt: new Date(),
      seen: false,
      status: "sending",
      isTemp: true
    };

    pendingMessagesRef.current.set(tempId, tempMessage);
    setMessages(prev => [...prev, tempMessage]);

    try {
      let endpoint, postData;
      
      if (messageData.mediaUrls && messageData.mediaUrls.length > 0) {
        endpoint = `/api/messages/send-media/${selectedUser._id}`;
        postData = {
          text: messageData.text || "",
          mediaUrls: messageData.mediaUrls,
          fileType: fileType,
          replyTo: messageData.replyTo
        };
      } else {
        endpoint = `/api/messages/send/${selectedUser._id}`;
        postData = { 
          text: messageData.text,
          emojis: messageData.emojis,
          replyTo: messageData.replyTo,
          fileType: fileType
        };
      }

      const { data } = await api.post(endpoint, postData);

      if (data.success) {
        console.log('✅ Message sent successfully, server ID:', data.newMessage._id);
        
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempId
              ? { ...data.newMessage, status: "delivered" }
              : msg
          )
        );
        
        if (selectedUser?._id) {
          const currentMessages = getCachedMessages(selectedUser._id) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg._id === tempId ? { ...data.newMessage, status: "delivered" } : msg
          ).filter(msg => msg._id !== tempId);
          updatedMessages.push({ ...data.newMessage, status: "delivered" });
          setCachedMessages(selectedUser._id, updatedMessages);
        }
        
        if (socket) {
          socket.emit("sendMessage", {
            ...data.newMessage,
            tempId: tempId
          });
        }
        
        pendingMessagesRef.current.delete(tempId);
        
      } else {
        throw new Error(data.message);
      }

    } catch (error) {
      console.error("Send message error:", error);
      
      if (error.response?.status === 403) {
        toast.error("You are not allowed to send messages to this user");
      } else if (error.response?.status === 404) {
        toast.error("User not found or no longer available");
      } else {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      
      pendingMessagesRef.current.delete(tempId);
    }
  };

  const sendGroupMessage = async (messageData) => {
    if (!selectedGroup) {
      toast.error("No group selected");
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    let fileType = 'other';
    if (messageData.mediaUrls && messageData.mediaUrls.length > 0) {
      fileType = messageData.fileType || 'other';
    }

    const tempMessage = {
      _id: tempId,
      senderId: authUser,
      receiverId: selectedGroup._id,
      receiverType: 'Group',
      text: messageData.text || "",
      media: messageData.mediaUrls || [],
      fileType: fileType,
      emojis: messageData.emojis || [],
      replyTo: messageData.replyTo,
      createdAt: new Date(),
      seen: false,
      status: "sending",
      isTemp: true
    };

    pendingMessagesRef.current.set(tempId, tempMessage);
    setMessages(prev => [...prev, tempMessage]);

    try {
      const endpoint = `/api/groups/${selectedGroup._id}/send`;
      const postData = {
        text: messageData.text || "",
        mediaUrls: messageData.mediaUrls || [],
        fileType: fileType,
        emojis: messageData.emojis || [],
        replyTo: messageData.replyTo
      };

      const { data } = await api.post(endpoint, postData);

      if (data.success) {
        console.log('✅ Group message sent successfully, server ID:', data.newMessage._id);
        
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempId
              ? { ...data.newMessage, status: "delivered" }
              : msg
          )
        );
        
        if (selectedGroup?._id) {
          const currentMessages = getCachedMessages(selectedGroup._id) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg._id === tempId ? { ...data.newMessage, status: "delivered" } : msg
          ).filter(msg => msg._id !== tempId);
          updatedMessages.push({ ...data.newMessage, status: "delivered" });
          setCachedMessages(selectedGroup._id, updatedMessages);
        }
        
        if (socket) {
          socket.emit("sendGroupMessage", {
            ...data.newMessage,
            tempId: tempId
          });
        }
        
        pendingMessagesRef.current.delete(tempId);
        
      } else {
        throw new Error(data.message);
      }

    } catch (error) {
      console.error("Send group message error:", error);
      
      if (error.response?.status === 403) {
        toast.error("You are not allowed to send messages to this group");
      } else if (error.response?.status === 404) {
        toast.error("Group not found or no longer available");
      } else {
        toast.error(error.response?.data?.message || "Failed to send message");
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      
      pendingMessagesRef.current.delete(tempId);
    }
  };

  const sendVoiceMessage = useCallback(async (audioBlob, receiverId, receiverType = 'User') => {
    if (!receiverId || !authUser) {
      toast.error("No receiver selected");
      return;
    }

    try {
      toast.loading('Sending voice message...');

      // Convert blob to base64 for upload
      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      // Upload audio file
      const uploadRes = await api.post('/api/upload', {
        file: base64Audio,
        resourceType: 'audio',
        filename: `voice-${Date.now()}.webm`
      });

      if (uploadRes.data.success) {
        const messageData = {
          text: '',
          mediaUrls: [uploadRes.data.url],
          fileType: 'audio'
        };

        if (receiverType === 'Group') {
          await sendGroupMessage(messageData);
        } else {
          await sendMessage(messageData);
        }
        
        toast.dismiss();
        toast.success('Voice message sent!');
      } else {
        throw new Error('Upload failed');
      }

    } catch (error) {
      console.error("Voice message error:", error);
      toast.dismiss();
      toast.error("Failed to send voice message");
    }
  }, [api, authUser, sendMessage, sendGroupMessage]);

  const editMessage = async (messageId, newText) => {
    if (!messageId || !newText?.trim()) return;

    try {
      const { data } = await api.put(`/api/messages/${messageId}/edit`, { text: newText });
      
      if (data.success) {
        if (socket) {
          const message = messages.find(msg => msg._id === messageId);
          if (message) {
            socket.emit("messageEdited", {
              messageId,
              text: newText,
              chatId: selectedUser?._id || selectedGroup?._id,
              receiverType: message.receiverType,
              editedAt: new Date()
            });
          }
        }
        
        const chatId = selectedUser?._id || selectedGroup?._id;
        if (chatId) {
          const currentMessages = getCachedMessages(chatId) || [];
          const updatedMessages = currentMessages.map(msg => 
            msg._id === messageId ? { ...msg, text: newText, isEdited: true } : msg
          );
          setCachedMessages(chatId, updatedMessages);
        }
        
        toast.success("Message updated");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Edit message error:", error);
      toast.error(error.response?.data?.message || "Failed to edit message");
    }
  };

  const deleteMessageById = async (messageId, deleteForEveryone = false) => {
    if (!messageId) return;
    
    try {
      const endpoint = deleteForEveryone 
        ? `/api/messages/delete/${messageId}?forEveryone=true`
        : `/api/messages/delete/${messageId}`;
      
      const { data } = await api.delete(endpoint);
      
      if (data.success) {
        if (socket) {
          const message = messages.find(msg => msg._id === messageId);
          if (message) {
            socket.emit("messageDeleted", {
              messageId,
              chatId: selectedUser?._id || selectedGroup?._id,
              receiverType: message.receiverType,
              deleteForEveryone
            });
          }
        }
        
        const chatId = selectedUser?._id || selectedGroup?._id;
        if (chatId) {
          const currentMessages = getCachedMessages(chatId) || [];
          const updatedMessages = currentMessages.filter(msg => msg._id !== messageId);
          setCachedMessages(chatId, updatedMessages);
        }
        
        toast.success(deleteForEveryone ? "Message deleted for everyone" : "Message deleted");
        return { success: true };
      } else {
        toast.error(data.message);
        return { success: false, error: data.message };
      }
    } catch (err) {
      console.error("Delete message error:", err);
      
      if (err.response?.status === 403) {
        toast.error("You are not authorized to delete this message");
        return { success: false, error: "Not authorized" };
      } else if (err.response?.status === 404) {
        toast.error("Message not found");
        return { success: false, error: "Message not found" };
      } else {
        toast.error(err.response?.data?.message || "Failed to delete message");
        return { success: false, error: "Delete failed" };
      }
    }
  };

  const reactToMessage = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      const { data } = await api.post(`/api/messages/${messageId}/reaction`, { emoji });
      
      if (data.success) {
        if (socket) {
          const message = messages.find(msg => msg._id === messageId);
          if (message) {
            socket.emit("messageReaction", {
              messageId,
              emoji,
              chatId: selectedUser?._id || selectedGroup?._id,
              receiverType: message.receiverType,
              userId: authUser._id
            });
          }
        }
        
        // Optimistic update
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
            
            if (existingReaction) {
              return {
                ...msg,
                reactions: msg.reactions.map(r =>
                  r.emoji === emoji
                    ? {
                        ...r,
                        count: r.count + 1,
                        users: [...(r.users || []), authUser._id]
                      }
                    : r
                )
              };
            } else {
              return {
                ...msg,
                reactions: [
                  ...(msg.reactions || []),
                  {
                    emoji,
                    count: 1,
                    users: [authUser._id]
                  }
                ]
              };
            }
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error("React to message error:", error);
      toast.error("Failed to react to message");
    }
  }, [socket, authUser, messages, selectedUser, selectedGroup, api]);

  const removeReaction = useCallback(async (messageId, emoji) => {
    if (!messageId || !emoji) return;

    try {
      const { data } = await api.delete(`/api/messages/${messageId}/reaction`, { data: { emoji } });
      
      if (data.success) {
        if (socket) {
          const message = messages.find(msg => msg._id === messageId);
          if (message) {
            socket.emit("reactionRemoved", {
              messageId,
              emoji,
              chatId: selectedUser?._id || selectedGroup?._id,
              receiverType: message.receiverType,
              userId: authUser._id
            });
          }
        }
        
        // Optimistic update
        setMessages(prev => prev.map(msg => {
          if (msg._id === messageId) {
            const updatedReactions = msg.reactions
              ?.map(r => {
                if (r.emoji === emoji) {
                  const newCount = r.count - 1;
                  const newUsers = r.users?.filter(id => id !== authUser._id);
                  return newCount > 0 
                    ? { ...r, count: newCount, users: newUsers }
                    : null;
                }
                return r;
              })
              .filter(Boolean);
            
            return {
              ...msg,
              reactions: updatedReactions || []
            };
          }
          return msg;
        }));
      }
    } catch (error) {
      console.error("Remove reaction error:", error);
      toast.error("Failed to remove reaction");
    }
  }, [socket, authUser, messages, selectedUser, selectedGroup, api]);

  const markMessagesAsSeen = useCallback(async (chatId) => {
    if (!chatId || !authUser) return;

    try {
      console.log(`👀 Marking messages as seen for chat: ${chatId}`);

      setUnseenMessages(prev => {
        const updated = { ...prev };
        delete updated[chatId];
        return updated;
      });

      setMessages(prev => 
        prev.map(msg => {
          const isUserMessage = msg.receiverType === 'User';
          const isGroupMessage = msg.receiverType === 'Group';
          
          if (isUserMessage && 
              msg.senderId?._id === chatId && 
              msg.receiverId === authUser._id && 
              !msg.seen) {
            return {
              ...msg,
              seen: true,
              seenAt: new Date(),
              status: "seen"
            };
          }
          
          if (isGroupMessage && 
              msg.receiverId === chatId && 
              !msg.seenBy?.some(seen => seen.userId === authUser._id)) {
            return {
              ...msg,
              seenBy: [...(msg.seenBy || []), { userId: authUser._id, seenAt: new Date() }],
              status: "seen"
            };
          }
          return msg;
        })
      );

      const currentChatId = selectedUser?._id || selectedGroup?._id;
      if (currentChatId === chatId) {
        const currentMessages = getCachedMessages(chatId) || [];
        const updatedMessages = currentMessages.map(msg => ({
          ...msg,
          seen: true,
          seenAt: new Date(),
          status: "seen"
        }));
        setCachedMessages(chatId, updatedMessages);
      }

      if (socket) {
        const isGroupChat = groups.some(group => group._id === chatId);
        
        if (isGroupChat) {
          socket.emit('markGroupMessagesSeen', {
            groupId: chatId,
            userId: authUser._id
          });
        } else {
          socket.emit('markMessagesSeen', {
            chatId,
            userId: authUser._id
          });
        }
      }

    } catch (error) {
      console.error("❌ Mark messages as seen error:", error);
    }
  }, [authUser, groups, socket, selectedUser, selectedGroup, getCachedMessages, setCachedMessages]);

  const forwardMessagesToUser = async (messagesToForward, recipientIds, receiverType = 'User') => {
    if (!messagesToForward.length || !recipientIds.length) {
      toast.error("No messages or recipients selected");
      return;
    }

    try {
      const { data } = await api.post("/api/messages/forward", {
        messageIds: messagesToForward.map(msg => msg._id),
        receiverIds: recipientIds,
        receiverType
      });
      
      if (data.success) {
        setForwardedMessages(prev => [...prev, ...data.forwardedMessages]);
        toast.success("Message forwarded successfully");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      console.error("Forward error:", err);
      toast.error(err.response?.data?.message || "Failed to forward messages");
    }
  };

  const sendTypingStatus = useCallback((status) => {
    if (!socket || (!selectedUser && !selectedGroup)) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    const chatId = selectedUser?._id || selectedGroup?._id;
    const isGroupChat = !!selectedGroup;

    if (status) {
      if (isGroupChat) {
        socket.emit("groupTyping", {
          groupId: chatId,
          isTyping: true,
          userName: authUser?.fullName
        });
      } else {
        socket.emit("typing", {
          receiverId: chatId,
          isTyping: true,
          userName: authUser?.fullName
        });
      }

      typingTimeoutRef.current = setTimeout(() => {
        if (isGroupChat) {
          socket.emit("groupTyping", {
            groupId: chatId,
            isTyping: false,
            userName: authUser?.fullName
          });
        } else {
          socket.emit("typing", {
            receiverId: chatId,
            isTyping: false,
            userName: authUser?.fullName
          });
        }
      }, 3000);
    } else {
      if (isGroupChat) {
        socket.emit("groupTyping", {
          groupId: chatId,
          isTyping: false,
          userName: authUser?.fullName
        });
      } else {
        socket.emit("typing", {
          receiverId: chatId,
          isTyping: false,
          userName: authUser?.fullName
        });
      }
    }
  }, [socket, selectedUser, selectedGroup, authUser]);

  // ========== PINNED MESSAGES ==========

  const pinMessage = useCallback(async (messageId) => {
    try {
      const { data } = await api.post(`/api/messages/${messageId}/pin`);
      if (data.success) {
        setPinnedMessages(prev => [...prev, data.pinnedMessage]);
        toast.success("Message pinned");
        return true;
      }
    } catch (error) {
      console.error("Pin message error:", error);
      toast.error("Failed to pin message");
      return false;
    }
  }, [api]);

  const unpinMessage = useCallback(async (messageId) => {
    try {
      const { data } = await api.delete(`/api/messages/${messageId}/pin`);
      if (data.success) {
        setPinnedMessages(prev => prev.filter(msg => msg._id !== messageId));
        toast.success("Message unpinned");
        return true;
      }
    } catch (error) {
      console.error("Unpin message error:", error);
      toast.error("Failed to unpin message");
      return false;
    }
  }, [api]);

  const getPinnedMessages = useCallback(async (chatId) => {
    if (!chatId) return [];
    
    try {
      console.log(`📌 Fetching pinned messages for chat: ${chatId}`);
      
      const isGroupChat = groups.some(group => group._id === chatId) || selectedGroup;
      
      let endpoint;
      if (isGroupChat) {
        endpoint = `/api/groups/${chatId}/pinned-messages`;
      } else {
        endpoint = `/api/messages/pinned/${chatId}`;
      }
      
      const { data } = await api.get(endpoint);
      
      if (data.success) {
        console.log(`✅ Loaded ${data.pinnedMessages?.length || 0} pinned messages`);
        setPinnedMessages(data.pinnedMessages || []);
        return data.pinnedMessages || [];
      } else {
        console.warn('⚠️ No pinned messages endpoint or empty response');
        setPinnedMessages([]);
        return [];
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('📌 Pinned messages endpoint not available, returning empty array');
      } else {
        console.error("Get pinned messages error:", error);
      }
      setPinnedMessages([]);
      return [];
    }
  }, [api, groups, selectedGroup]);

  // ========== CHAT SETTINGS ==========

  const updateChatSettings = useCallback((chatId, settings) => {
    setChatSettings(prev => ({
      ...prev,
      [chatId]: { ...prev[chatId], ...settings }
    }));
  }, []);

  const getChatSettings = useCallback((chatId) => {
    return chatSettings[chatId] || {};
  }, [chatSettings]);

  // ========== FILE UPLOAD ==========

  const uploadFile = async (file, onProgress = null) => {
    try {
      console.log("📤 Uploading file:", file.name, file.type, file.size);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      });

      if (response.data.success) {
        console.log("✅ File uploaded successfully:", response.data.file);
        return response.data.file.secure_url || response.data.file.url;
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message.includes('Network Error')) {
        throw new Error('Network error: Please check your connection');
      } else {
        throw new Error('Failed to upload file');
      }
    }
  };

  const uploadAudio = async (base64Audio) => {
    try {
      console.log("🎤 Uploading audio file...");
      
      const response = await api.post('/api/upload/base64', {
        file: base64Audio,
        filename: `voice-${Date.now()}.webm`,
        resourceType: 'video'
      });

      if (response.data.success) {
        console.log("✅ Audio uploaded successfully:", response.data.file);
        return response.data;
      } else {
        throw new Error(response.data.message || 'Audio upload failed');
      }
    } catch (error) {
      console.error("❌ Audio upload error:", error);
      throw new Error(error.response?.data?.message || 'Failed to upload audio');
    }
  };

  // ========== FRIENDS FOR SIDEBAR ==========

  const getFriendsForSidebar = useCallback(async () => {
    if (!authUser) return;
    
    try {
      const { data } = await api.get("/api/users/friends/sidebar");
      if (data.success) {
        setUsers(data.friends || []);
        setUnseenMessages(data.unseenMessages || {});
        return data.friends;
      }
    } catch (error) {
      console.error("Get friends for sidebar error:", error);
      return getFriends();
    }
  }, [api, authUser, getFriends]);

  // ========== CLEAR CHAT ==========

  const clearChatPermanently = useCallback(async (chatId) => {
    if (!chatId || !authUser) {
        console.log('❌ Missing chatId or authUser');
        return false;
    }

    try {
        console.log('🔍 FRONTEND - Clear Chat Called (User-specific):');
        console.log('   - Chat ID:', chatId);
        console.log('   - Auth User ID:', authUser._id);
        
        const endpoint = `/api/messages/clear/${chatId}`;
        console.log('   - Calling endpoint:', endpoint);

        const { data } = await api.delete(endpoint);
        
        console.log('   - Backend response:', data);
        
        if (data.success) {
            console.log(`✅ CHAT CLEARED SUCCESS - Cleared ${data.deletedCount} messages for current user only`);
            
            if (selectedUser?._id === chatId || selectedGroup?._id === chatId) {
                setMessages([]);
            }
            
            clearCachedMessages(chatId);
            
            toast.success(`Chat cleared (${data.deletedCount} messages removed from your view)`);
            return true;
        } else {
            console.log('❌ Backend returned success: false');
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('❌ FRONTEND - Clear chat error:', error);
        console.error('   - Error response:', error.response?.data);
        toast.error(error.response?.data?.message || "Failed to clear chat");
        return false;
    }
  }, [api, authUser, clearCachedMessages, selectedUser, selectedGroup]);

  // ========== BLOCK/UNBLOCK USERS ==========

  const blockUser = useCallback(async (userId) => {
    try {
      const { data } = await api.put(`/api/users/block/${userId}`);
      if (data.success) {
        setBlockedUsers(prev => [...prev, userId]);
        toast.success("User blocked successfully");
        
        if (selectedUser?._id === userId) {
          setSelectedUser(null);
        }
      }
    } catch (error) {
      console.error("Block user error:", error);
      toast.error(error.response?.data?.message || "Failed to block user");
    }
  }, [api, selectedUser]);

  const unblockUser = useCallback(async (userId) => {
    try {
      const { data } = await api.put(`/api/users/unblock/${userId}`);
      if (data.success) {
        setBlockedUsers(prev => prev.filter(id => id !== userId));
        toast.success("User unblocked successfully");
      }
    } catch (error) {
      console.error("Unblock user error:", error);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    }
  }, [api]);

  // ========== TRENDING CHATS ==========

  const getTrendingChats = useCallback(async () => {
    try {
      const trending = groups
        .sort((a, b) => b.members.length - a.members.length)
        .slice(0, 5)
        .map(group => ({ ...group, type: 'group', trending: true }));
      
      setTrendingChats(trending);
    } catch (error) {
      console.error("Trending chats error:", error);
    }
  }, [groups]);

  // ========== CHAT CONTENT EXTRACTION ==========

  const extractChatContent = useCallback((messages) => {
    if (!messages || messages.length === 0) return;

    const media = messages
      .filter(msg => msg.media && msg.media.length > 0)
      .flatMap(msg => msg.media)
      .filter(url => typeof url === 'string' && url.includes('http'));
    setChatMedia([...new Set(media)]);

    const links = messages
      .filter(msg => msg.text && typeof msg.text === 'string')
      .map(msg => {
        const urlRegex = /https?:\/\/[^\s]+/g;
        const links = msg.text.match(urlRegex);
        return links ? links.map(link => ({ 
          link, 
          timestamp: msg.createdAt,
          sender: msg.senderId?._id === authUser?._id ? 'You' : (isGroup ? msg.senderName : selectedUser?.fullName),
          messageId: msg._id
        })) : [];
      })
      .flat();
    setSharedLinks([...new Set(links)]);

    const docs = messages
      .filter(msg => msg.media && msg.media.length > 0)
      .flatMap(msg => 
        msg.media.map(mediaUrl => {
          const fileType = getFileType(mediaUrl);
          if (fileType === 'document') {
            return {
              url: mediaUrl,
              name: mediaUrl.split('/').pop(),
              timestamp: msg.createdAt,
              type: fileType,
              sender: msg.senderId?._id === authUser?._id ? 'You' : (isGroup ? msg.senderName : selectedUser?.fullName),
              messageId: msg._id
            };
          }
          return null;
        })
      )
      .filter(doc => doc !== null);
    setSharedDocs(docs);

    const locations = messages
      .filter(msg => msg.location)
      .map(msg => ({
        location: msg.location,
        timestamp: msg.createdAt,
        sender: msg.senderId?._id === authUser?._id ? 'You' : (isGroup ? msg.senderName : selectedUser?.fullName),
        messageId: msg._id
      }));
    setSharedLocations(locations);
  }, [authUser, isGroup, selectedUser]);

  // ========== SOCKET EVENT HANDLERS ==========

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleIncomingMessage = (newMessage) => {
      console.log('📨 Incoming message:', newMessage);

      const isCurrentChat = selectedUser?._id === newMessage.senderId?._id || 
                           selectedUser?._id === newMessage.receiverId ||
                           (newMessage.receiverType === 'Group' && selectedGroup?._id === newMessage.receiverId);

      const isForCurrentUser = newMessage.receiverId === authUser._id || 
                              (newMessage.receiverType === 'Group' && selectedGroup?._id === newMessage.receiverId) ||
                              newMessage.senderId?._id === authUser._id;

      if (isCurrentChat || isForCurrentUser) {
        setMessages(prev => {
          const messageExists = prev.some(msg => 
            msg._id === newMessage._id || 
            (msg._id && msg._id.startsWith('temp_') && 
             msg.senderId?._id === authUser?._id && 
             msg.text === newMessage.text &&
             Math.abs(new Date(msg.createdAt) - new Date(newMessage.createdAt)) < 5000)
          );
          
          if (messageExists) {
            console.log('🔄 Skipping duplicate message:', newMessage._id);
            return prev;
          }
          
          console.log('✅ Adding new message to chat');
          const updatedMessages = [...prev, newMessage];
          
          const chatId = selectedUser?._id || selectedGroup?._id;
          if (chatId) {
            setCachedMessages(chatId, updatedMessages);
          }
          
          return updatedMessages;
        });

        if (pendingMessagesRef.current.has(newMessage._id)) {
          pendingMessagesRef.current.delete(newMessage._id);
        }
      }

      if (!isCurrentChat) {
        const chatId = newMessage.receiverType === 'Group' ? newMessage.receiverId : newMessage.senderId?._id;
        setUnseenMessages(prev => ({
          ...prev,
          [chatId]: (prev[chatId] || 0) + 1
        }));
      }
    };

    const handleMessageSeen = (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId && (selectedUser?._id === data.chatId || selectedGroup?._id === data.chatId)
            ? { ...msg, seen: true, seenBy: data.seenBy, status: "seen" }
            : msg
        )
      );
      
      if (selectedUser?._id === data.chatId || selectedGroup?._id === data.chatId) {
        const currentMessages = getCachedMessages(data.chatId) || [];
        const updatedMessages = currentMessages.map(msg =>
          msg._id === data.messageId
            ? { ...msg, seen: true, seenBy: data.seenBy, status: "seen" }
            : msg
        );
        setCachedMessages(data.chatId, updatedMessages);
      }
    };

    const handleMessageReaction = (data) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id === data.messageId) {
          const existingReaction = msg.reactions?.find(r => r.emoji === data.emoji);
          
          if (existingReaction) {
            return {
              ...msg,
              reactions: msg.reactions.map(r =>
                r.emoji === data.emoji
                  ? {
                      ...r,
                      count: r.count + 1,
                      users: [...(r.users || []), data.userId]
                    }
                  : r
              )
            };
          } else {
            return {
              ...msg,
              reactions: [
                ...(msg.reactions || []),
                {
                  emoji: data.emoji,
                  count: 1,
                  users: [data.userId]
                }
              ]
            };
          }
        }
        return msg;
      }));
    };

    const handleReactionRemoved = (data) => {
      setMessages(prev => prev.map(msg => {
        if (msg._id === data.messageId) {
          const updatedReactions = msg.reactions
            ?.map(r => {
              if (r.emoji === data.emoji) {
                const newCount = r.count - 1;
                const newUsers = r.users?.filter(id => id !== data.userId);
                return newCount > 0 
                  ? { ...r, count: newCount, users: newUsers }
                  : null;
              }
              return r;
            })
            .filter(Boolean);
          
          return {
            ...msg,
            reactions: updatedReactions || []
          };
        }
        return msg;
      }));
    };

    const handleMessageEdited = (data) => {
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId
            ? { ...msg, text: data.text, isEdited: true, editedAt: data.editedAt }
            : msg
        )
      );
      
      const chatId = selectedUser?._id || selectedGroup?._id;
      if (chatId) {
        const currentMessages = getCachedMessages(chatId) || [];
        const updatedMessages = currentMessages.map(msg =>
          msg._id === data.messageId
            ? { ...msg, text: data.text, isEdited: true, editedAt: data.editedAt }
            : msg
        );
        setCachedMessages(chatId, updatedMessages);
      }
    };

    const handleMessageDeleted = (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      
      const chatId = selectedUser?._id || selectedGroup?._id;
      if (chatId) {
        const currentMessages = getCachedMessages(chatId) || [];
        const updatedMessages = currentMessages.filter(msg => msg._id !== data.messageId);
        setCachedMessages(chatId, updatedMessages);
      }
    };

    const handleUserJoinedGroup = (data) => {
      getMyGroups();
      if (selectedGroup?._id === data.groupId) {
        toast.success(`${data.userName || 'A user'} joined the group`);
      }
    };

    const handleUserLeftGroup = (data) => {
      getMyGroups();
      if (selectedGroup?._id === data.groupId) {
        toast.info(`${data.userName || 'A user'} left the group`);
      }
    };

    const handleGroupUpdated = (data) => {
      getMyGroups();
      if (selectedGroup?._id === data.group._id) {
        setSelectedGroup(data.group);
        toast.success("Group updated successfully");
      }
    };

    const handleMessageDelivered = (data) => {
      console.log('📬 Message delivered:', data.messageId);
      setMessages(prev =>
        prev.map(msg =>
          msg._id === data.messageId || msg._id === data.tempId
            ? { ...msg, status: "delivered", _id: data.messageId }
            : msg
        )
      );
      
      const chatId = selectedUser?._id || selectedGroup?._id;
      if (chatId) {
        const currentMessages = getCachedMessages(chatId) || [];
        const updatedMessages = currentMessages.map(msg =>
          msg._id === data.messageId || msg._id === data.tempId
            ? { ...msg, status: "delivered", _id: data.messageId }
            : msg
        );
        setCachedMessages(chatId, updatedMessages);
      }
    };

    const handleTyping = ({ senderId, isTyping, receiverId, userName }) => {
      if (selectedUser?._id === senderId || receiverId === authUser?._id) {
        setIsTyping(isTyping);
        
        if (isTyping) {
          setTypingUsers(prev => ({
            ...prev,
            [senderId]: userName || senderId
          }));
        } else {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[senderId];
            return updated;
          });
        }
      }
    };

    const handleGroupTyping = ({ userId, userName, isTyping, groupId }) => {
      if (selectedGroup?._id === groupId) {
        setIsTyping(isTyping);
        if (isTyping) {
          setTypingUsers(prev => ({
            ...prev,
            [userId]: userName || userId
          }));
        } else {
          setTypingUsers(prev => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });
        }
      }
    };

    const handleFriendRequest = (data) => {
      toast.success(`Friend request from ${data.fromUser?.fullName || 'Unknown User'}`);
      getFriends();
    };

    const handleFriendRequestAccepted = (data) => {
      toast.success(`${data.acceptedUser?.fullName || 'User'} accepted your friend request`);
      getFriends();
    };

    const handleMessagePinned = (data) => {
      setPinnedMessages(prev => [...prev, data.pinnedMessage]);
    };

    const handleMessageUnpinned = (data) => {
      setPinnedMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    };

    const handleChatCleared = (data) => {
      try {
        const { chatId, clearedBy, clearedByName, clearedForUserOnly, message } = data || {};
        
        console.log(`🗑️ Received chat cleared event:`, data);
        
        if ((selectedUser?._id === chatId || selectedGroup?._id === chatId) && clearedBy !== authUser._id) {
          toast.info(message || `${clearedByName} cleared their chat history`);
          console.log(`ℹ️ ${clearedByName} cleared their chat - your messages remain unchanged`);
        }
        
      } catch (err) {
        console.error('❌ Error handling chatCleared event:', err);
      }
    };

    // Register event listeners
    socket.on("newMessage", handleIncomingMessage);
    socket.on("newGroupMessage", handleIncomingMessage);
    socket.on("messageSeen", handleMessageSeen);
    socket.on("messageReaction", handleMessageReaction);
    socket.on("reactionRemoved", handleReactionRemoved);
    socket.on("messageEdited", handleMessageEdited);
    socket.on("messageDeleted", handleMessageDeleted);
    socket.on("userJoinedGroup", handleUserJoinedGroup);
    socket.on("userLeftGroup", handleUserLeftGroup);
    socket.on("groupUpdated", handleGroupUpdated);
    socket.on("messageDelivered", handleMessageDelivered);
    socket.on("typing", handleTyping);
    socket.on("groupTyping", handleGroupTyping);
    socket.on("friendRequestReceived", handleFriendRequest);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);
    socket.on("messagePinned", handleMessagePinned);
    socket.on("messageUnpinned", handleMessageUnpinned);
    socket.on('chatCleared', handleChatCleared);

    return () => {
      socket.off("newMessage", handleIncomingMessage);
      socket.off("newGroupMessage", handleIncomingMessage);
      socket.off("messageSeen", handleMessageSeen);
      socket.off("messageReaction", handleMessageReaction);
      socket.off("reactionRemoved", handleReactionRemoved);
      socket.off("messageEdited", handleMessageEdited);
      socket.off("messageDeleted", handleMessageDeleted);
      socket.off("userJoinedGroup", handleUserJoinedGroup);
      socket.off("userLeftGroup", handleUserLeftGroup);
      socket.off("groupUpdated", handleGroupUpdated);
      socket.off("messageDelivered", handleMessageDelivered);
      socket.off("typing", handleTyping);
      socket.off("groupTyping", handleGroupTyping);
      socket.off("friendRequestReceived", handleFriendRequest);
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
      socket.off("messagePinned", handleMessagePinned);
      socket.off("messageUnpinned", handleMessageUnpinned);
      socket.off('chatCleared', handleChatCleared);
    };
  }, [socket, selectedUser, selectedGroup, authUser, getMyGroups, getFriends, getCachedMessages, setCachedMessages]);

  // ========== OTHER EFFECTS ==========

  const fetchInitialData = useCallback(async () => {
    if (!authUser) return;
    
    try {
      console.log('🔄 Fetching initial data...');
      await Promise.all([
        getUsers(),
        getMyGroups(),
        getFriends(),
        getFavorites()
      ]);
      console.log('✅ Initial data loaded');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  }, [authUser, getUsers, getMyGroups, getFriends, getFavorites]); 

  useEffect(() => {
    if (authUser) {
      fetchInitialData();
    }
  }, [authUser]);

  useEffect(() => {
    const currentChatId = selectedUser?._id || selectedGroup?._id;
    if (currentChatId !== prevSelectedUserRef.current) {
      console.log("🔄 Chat switched to:", currentChatId);
      
      if (selectedUser || selectedGroup) {
        const cachedMessages = getCachedMessages(currentChatId);
        if (cachedMessages && cachedMessages.length > 0) {
          console.log('📦 Loading cached messages:', cachedMessages.length);
          setMessages(cachedMessages);
        } else {
          setMessages([]);
        }
        
        addToRecentChats(selectedUser || selectedGroup);
      } else {
        setMessages([]);
      }
      
      setTypingUsers({});
      setIsTyping(false);
      setReactions({});
      setMessageReplies({});
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      prevSelectedUserRef.current = currentChatId;
    }
  }, [selectedUser?._id, selectedGroup?._id, addToRecentChats, getCachedMessages]);

  useEffect(() => {
    if (socket && selectedGroup) {
      socket.emit("joinGroup", selectedGroup._id);
    }

    return () => {
      if (socket && selectedGroup) {
        socket.emit("leaveGroup", selectedGroup._id);
      }
    };
  }, [socket, selectedGroup]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (messages.length === 0 || (!selectedUser && !selectedGroup)) return;

    const timeoutId = setTimeout(() => {
      extractChatContent(messages);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [messages.length, selectedUser?._id, selectedGroup?._id, extractChatContent]);

  useEffect(() => {
    getTrendingChats();
  }, [getTrendingChats]);

  // ========== CONTEXT VALUE ==========

  const contextValue = useMemo(() => ({
    // State
    messages,
    setMessages,
    users,
    groups,
    trendingChats,
    selectedUser,
    setSelectedUser,
    selectedGroup,
    setSelectedGroup,
    unseenMessages,
    setUnseenMessages,
    isTyping,
    typingUsers,
    reactions,
    messageReplies,
    forwardedMessages,
    pagination,
    blockedUsers,
    isLoadingMessages,
    chatMedia,
    sharedLinks,
    sharedDocs,
    sharedLocations,
    searchHistory,
    recentChats,
    pinnedMessages,
    chatSettings,
    favorites,
    
    // Friend system
    friends,
    friendRequests,
    sentRequests,
    
    // Privacy functions
    canViewUserProfile,
    canSendMessageToUser,
    canSendFriendRequest,
    
    // Core functions
    getUsers,
    getMyGroups,
    searchUsers,
    searchUsersByEmail,
    enhancedSearchUsers,
    searchGroups,
    getMessage,
    sendMessage,
    sendGroupMessage,
    sendVoiceMessage,
    markMessagesAsSeen,
    sendTypingStatus,
    
    // Friend management
    getFriends,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    
    // Favorites management
    addFavorite,
    removeFavorite,
    getFavorites,
    
    // Message actions
    reactToMessage,
    removeReaction,
    editMessage,
    deleteMessageById,
    forwardMessagesToUser,
    pinMessage,
    unpinMessage,
    getPinnedMessages,
    
    // Group management
    createGroup,
    addMemberToGroup,
    removeMemberFromGroup,
    leaveGroup,
    updateGroupInfo,
    
    // User management
    blockUser,
    unblockUser,
    
    // Search and history management
    addToSearchHistory,
    clearSearchHistory,
    addToRecentChats,
    removeFromRecentChats,
    clearRecentChats,
    
    // Chat settings
    updateChatSettings,
    getChatSettings,
    getFriendsForSidebar,
    
    // Utilities
    downloadFile,
    getFileIcon,
    getFileType,
    uploadFile,
    uploadAudio,
    
    // Caching functions
    getCachedMessages,
    setCachedMessages,
    getPinnedMessages,
    clearCachedMessages,
    
    // Enhanced functions
    clearChatPermanently,
    
    // Additional data
    onlineUsers,
    isGroup: !!selectedGroup,
  }), [
    messages, users, groups, trendingChats, selectedUser, selectedGroup, unseenMessages, isTyping, 
    typingUsers, reactions, messageReplies, forwardedMessages, pagination, blockedUsers,
    isLoadingMessages, chatMedia, sharedLinks, sharedDocs, sharedLocations, searchHistory,
    recentChats, pinnedMessages, chatSettings, favorites, friends, friendRequests, sentRequests,
    canViewUserProfile, canSendMessageToUser, canSendFriendRequest, getUsers, getMyGroups,
    searchUsers, searchUsersByEmail, enhancedSearchUsers, searchGroups, getMessage, sendMessage,
    sendGroupMessage, sendVoiceMessage, markMessagesAsSeen, sendTypingStatus, getFriends,
    sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, addFavorite,
    removeFavorite, getFavorites, reactToMessage, removeReaction, editMessage, deleteMessageById, 
    forwardMessagesToUser, pinMessage, unpinMessage, getPinnedMessages, createGroup, 
    addMemberToGroup, removeMemberFromGroup, leaveGroup, updateGroupInfo, blockUser, unblockUser, 
    addToSearchHistory, clearSearchHistory, addToRecentChats, removeFromRecentChats, clearRecentChats, 
    updateChatSettings, getChatSettings, getFriendsForSidebar, downloadFile, getFileIcon, getFileType, 
    uploadFile, uploadAudio, getCachedMessages, setCachedMessages, clearCachedMessages, 
    clearChatPermanently, onlineUsers
  ]);

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ChatProvider;