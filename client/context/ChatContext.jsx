import { createContext, useState, useContext, useEffect, useCallback, useRef, useMemo } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [trendingChats, setTrendingChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
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
  const isGroup = selectedUser?.members;

  // ============ FRIEND SYSTEM FUNCTIONS ============

  // Get friends list
const getFriends = useCallback(async (retryCount = 0) => {
  if (!authUser) return;
  
  try {
    console.log('📞 Fetching friends...');
    const { data } = await api.get("/api/auth/friends");
    if (data.success) {
      setFriends(data.friends || []);
      setFriendRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
      console.log('✅ Friends loaded:', data.friends?.length || 0);
    }
  } catch (error) {
    console.error("Get friends error:", error);
    
    // Retry logic (max 3 retries)
    if (retryCount < 3) {
      console.log(`🔄 Retrying friends fetch (${retryCount + 1}/3)...`);
      setTimeout(() => getFriends(retryCount + 1), 1000 * (retryCount + 1));
    } else {
      toast.error("Failed to load friends after multiple attempts");
    }
  }
}, [api, authUser]);
  // Send friend request
  const sendFriendRequest = useCallback(async (userId) => {
    try {
      const { data } = await api.post(`/api/auth/friend-request/${userId}`);
      if (data.success) {
        toast.success("Friend request sent");
        await getFriends(); // Refresh friends list
        return true;
      }
    } catch (error) {
      console.error("Send friend request error:", error);
      toast.error(error.response?.data?.message || "Failed to send friend request");
      return false;
    }
  }, [api, getFriends]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (userId) => {
    try {
      const { data } = await api.put(`/api/auth/friend-request/accept/${userId}`);
      if (data.success) {
        toast.success("Friend request accepted");
        await getFriends(); // Refresh friends list
        return true;
      }
    } catch (error) {
      console.error("Accept friend request error:", error);
      toast.error(error.response?.data?.message || "Failed to accept friend request");
      return false;
    }
  }, [api, getFriends]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (userId) => {
    try {
      const { data } = await api.put(`/api/auth/friend-request/reject/${userId}`);
      if (data.success) {
        toast.success("Friend request rejected");
        await getFriends(); // Refresh friends list
        return true;
      }
    } catch (error) {
      console.error("Reject friend request error:", error);
      toast.error(error.response?.data?.message || "Failed to reject friend request");
      return false;
    }
  }, [api, getFriends]);

  // Remove friend
  const removeFriend = useCallback(async (userId) => {
    try {
      const { data } = await api.delete(`/api/auth/friend/${userId}`);
      if (data.success) {
        toast.success("Friend removed");
        await getFriends(); // Refresh friends list
        return true;
      }
    } catch (error) {
      console.error("Remove friend error:", error);
      toast.error(error.response?.data?.message || "Failed to remove friend");
      return false;
    }
  }, [api, getFriends]);

  // Enhanced getUsers with friend priority
  const getUsers = useCallback(async () => {
    try {
      const { data } = await api.get("/api/messages/users");
      if (data.success) {
        // Separate friends and non-friends
        const friendsList = data.users.filter(user => 
          friends.some(friend => friend._id === user._id)
        );
        
        const nonFriends = data.users.filter(user => 
          !friends.some(friend => friend._id === user._id)
        );

        // Sort friends by last message, then non-friends
        const sortedUsers = [...friendsList, ...nonFriends];
        
        setUsers(sortedUsers);
        setUnseenMessages(data.unseenMessages || {});
        setBlockedUsers(data.blockedUsers || []);
      }
    } catch (error) {
      console.error("Get users error:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  }, [api, friends]);

  // Enhanced search with friend status
  const searchUsers = useCallback(async (query) => {
    try {
      const { data } = await api.get(`/api/auth/search?query=${encodeURIComponent(query)}`);
      if (data.success) {
        return data.users.map(user => ({
          ...user,
          isOnline: onlineUsers.includes(user._id),
          // Add friend status for UI
          isFriend: friends.some(friend => friend._id === user._id),
          hasPendingRequest: sentRequests.some(req => req.to === user._id && req.status === 'pending'),
          hasReceivedRequest: friendRequests.some(req => req.from === user._id && req.status === 'pending')
        }));
      }
      return [];
    } catch (error) {
      console.error("Search users error:", error);
      return [];
    }
  }, [api, onlineUsers, friends, sentRequests, friendRequests]);

  // Enhanced getMyGroups with last messages
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

  // Extract media, links, docs, and locations from messages
  const extractChatContent = useCallback((messages) => {
    if (!messages || messages.length === 0) return;

    // Extract media
    const media = messages
      .filter(msg => msg.media && msg.media.length > 0)
      .flatMap(msg => msg.media)
      .filter(url => typeof url === 'string' && url.includes('http'));
    setChatMedia([...new Set(media)]);

    // Extract links
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

    // Extract documents
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

    // Extract locations
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

   useEffect(() => {
    if (messages.length === 0 || !selectedUser) return;

    const timeoutId = setTimeout(() => {
      extractChatContent(messages);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [messages, selectedUser?._id]);

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

  const searchGroups = useCallback(async (query) => {
    try {
      const { data } = await api.get(`/api/groups/search?query=${encodeURIComponent(query)}`);
      return data.success ? data.groups : [];
    } catch (error) {
      console.error("Search groups error:", error);
      return [];
    }
  }, [api]);

  // Get Trending Chats
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

  // Block/Unblock users
  const blockUser = useCallback(async (userId) => {
    try {
      const { data } = await api.post(`/api/auth/block/${userId}`);
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
      const { data } = await api.post(`/api/auth/unblock/${userId}`);
      if (data.success) {
        setBlockedUsers(prev => prev.filter(id => id !== userId));
        toast.success("User unblocked successfully");
      }
    } catch (error) {
      console.error("Unblock user error:", error);
      toast.error(error.response?.data?.message || "Failed to unblock user");
    }
  }, [api]);

  // Initial load - include friends
  useEffect(() => {
    if (authUser) {
      getUsers();
      getMyGroups();
      getFriends(); // Load friends on initial load
    }
  }, [authUser, getUsers, getMyGroups, getFriends]);

  useEffect(() => {
    getTrendingChats();
  }, [getTrendingChats]);

  // Extract content when messages change
  useEffect(() => {
    if (messages.length === 0 || !selectedUser) return;

    const timeoutId = setTimeout(() => {
      extractChatContent(messages);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [messages.length, selectedUser?._id, extractChatContent]);

  // Reset messages and state when selected user changes
  useEffect(() => {
    if (selectedUser?._id !== prevSelectedUserRef.current) {
      console.log("🔄 Chat switched to:", selectedUser?._id);
      
      setMessages([]);
      setTypingUsers({});
      setIsTyping(false);
      setReactions({});
      setMessageReplies({});
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      
      prevSelectedUserRef.current = selectedUser?._id;
    }
  }, [selectedUser?._id]);

  // Enhanced typing indicators with friend notifications
  useEffect(() => {
    if (!socket) return;

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
      if (selectedUser?._id === groupId) {
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

    // Friend request notifications
    const handleFriendRequest = (data) => {
      toast.success(`Friend request from ${data.fromName}`);
      getFriends(); // Refresh friends list
    };

    const handleFriendRequestAccepted = (data) => {
      toast.success(`${data.byName} accepted your friend request`);
      getFriends(); // Refresh friends list
    };

    socket.on("typing", handleTyping);
    socket.on("groupTyping", handleGroupTyping);
    socket.on("friendRequestReceived", handleFriendRequest);
    socket.on("friendRequestAccepted", handleFriendRequestAccepted);
    
    return () => {
      socket.off("typing", handleTyping);
      socket.off("groupTyping", handleGroupTyping);
      socket.off("friendRequestReceived", handleFriendRequest);
      socket.off("friendRequestAccepted", handleFriendRequestAccepted);
    };
  }, [socket, selectedUser, authUser, getFriends]);

  // Enhanced typing status with debounce
  const sendTypingStatus = useCallback((status) => {
    if (!socket || !selectedUser) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (status) {
      socket.emit(isGroup ? "groupTyping" : "typing", {
        receiverId: selectedUser._id,
        isTyping: true,
        userName: authUser?.fullName
      });

      typingTimeoutRef.current = setTimeout(() => {
        socket.emit(isGroup ? "groupTyping" : "typing", {
          receiverId: selectedUser._id,
          isTyping: false,
          userName: authUser?.fullName
        });
      }, 3000);
    } else {
      socket.emit(isGroup ? "groupTyping" : "typing", {
        receiverId: selectedUser._id,
        isTyping: false,
        userName: authUser?.fullName
      });
    }
  }, [socket, selectedUser, isGroup, authUser]);

  // Message handling
  useEffect(() => {
    if (!socket || !authUser) return;

    const handleIncomingMessage = (newMessage) => {
      console.log('📨 Incoming message:', {
        id: newMessage._id,
        sender: newMessage.senderId?._id,
        receiver: newMessage.receiverId,
        currentUser: authUser._id,
        currentChat: selectedUser?._id
      });

      const isCurrentChat = selectedUser?._id === newMessage.senderId?._id || 
                           selectedUser?._id === newMessage.receiverId ||
                           (newMessage.receiverType === 'Group' && selectedUser?._id === newMessage.receiverId);

      const isForCurrentUser = newMessage.receiverId === authUser._id || 
                              (newMessage.receiverType === 'Group' && selectedUser?._id === newMessage.receiverId) ||
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
          return [...prev, newMessage];
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
          msg._id === data.messageId && selectedUser?._id === data.chatId
            ? { ...msg, seen: true, seenBy: data.seenBy, status: "seen" }
            : msg
        )
      );
    };

    const handleMessageReaction = (data) => {
      const message = messages.find(msg => msg._id === data.messageId);
      if (message && (message.receiverId === selectedUser?._id || message.senderId?._id === selectedUser?._id)) {
        setReactions(prev => ({
          ...prev,
          [data.messageId]: [
            ...(prev[data.messageId] || []).filter(r => r.userId !== data.userId),
            { userId: data.userId, emoji: data.emoji, reactedAt: data.reactedAt }
          ]
        }));
      }
    };

    const handleReactionRemoved = (data) => {
      const message = messages.find(msg => msg._id === data.messageId);
      if (message && (message.receiverId === selectedUser?._id || message.senderId?._id === selectedUser?._id)) {
        setReactions(prev => ({
          ...prev,
          [data.messageId]: (prev[data.messageId] || []).filter(r => r.userId !== data.userId)
        }));
      }
    };

    const handleMessageEdited = (data) => {
      const message = messages.find(msg => msg._id === data.messageId);
      if (message && (message.receiverId === selectedUser?._id || message.senderId?._id === selectedUser?._id)) {
        setMessages(prev =>
          prev.map(msg =>
            msg._id === data.messageId
              ? { ...msg, text: data.text, isEdited: true, editedAt: data.editedAt }
              : msg
          )
        );
      }
    };

    const handleMessageDeleted = (data) => {
      const message = messages.find(msg => msg._id === data.messageId);
      if (message && (message.receiverId === selectedUser?._id || message.senderId?._id === selectedUser?._id)) {
        setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
      }
    };

    const handleUserJoinedGroup = (data) => {
      getMyGroups();
      if (selectedUser?._id === data.groupId) {
        toast.success(`${data.userName || 'A user'} joined the group`);
      }
    };

    const handleUserLeftGroup = (data) => {
      getMyGroups();
      if (selectedUser?._id === data.groupId) {
        toast.info(`${data.userName || 'A user'} left the group`);
      }
    };

    const handleGroupUpdated = (data) => {
      getMyGroups();
      if (selectedUser?._id === data.group._id) {
        setSelectedUser(data.group);
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
    };

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
    };
  }, [socket, selectedUser, authUser, getMyGroups, messages]);

  // Group management functions
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
          setSelectedUser(null);
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

    const fetchInitialData = useCallback(async () => {
    if (!authUser) return;
    
    try {
      console.log('🔄 Fetching initial data...');
      await Promise.all([
        getUsers(),
        getMyGroups(),
        getFriends()
      ]);
      console.log('✅ Initial data loaded');
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
    }
  }, [authUser, getUsers, getMyGroups, getFriends]);

    useEffect(() => {
    if (authUser) {
      fetchInitialData();
    }
  }, [authUser, fetchInitialData]);

  const leaveGroup = async (groupId) => {
    try {
      const { data } = await api.post(`/api/groups/${groupId}/leave`);
      if (data.success) {
        await getMyGroups();
        
        if (socket) {
          socket.emit("leaveGroup", groupId);
          socket.emit("userLeftGroup", {
            groupId,
            userId: authUser._id,
            userName: authUser.fullName
          });
        }
        
        if (selectedUser?._id === groupId) {
          setSelectedUser(null);
        }
        
        toast.success("You left the group");
        return true;
      } else {
        toast.error(data.message);
        return false;
      }
    } catch (error) {
      console.error("Leave group error:", error);
      toast.error(error.response?.data?.message || "Failed to leave group");
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
        
        if (selectedUser?._id === groupId) {
          setSelectedUser(data.group);
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

  // Enhanced get messages with proper chat switching
  const getMessage = useCallback(async (chatId, page = 1) => {
    if (!chatId) return;
    
    if (currentChatIdRef.current === chatId && page === 1) return;
    currentChatIdRef.current = chatId;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();

    try {
      setIsLoadingMessages(true);
      
      const isGroupChat = groups.some(group => group._id === chatId) || selectedUser?.members;
      const endpoint = isGroupChat 
        ? `/api/groups/${chatId}/messages`
        : `/api/messages/${chatId}`;

      const { data } = await api.get(`${endpoint}?page=${page}&limit=50`, {
        signal: abortControllerRef.current.signal
      });
      
      if (data.success) {
        const msgs = data.messages.map(msg => ({
          ...msg,
          status: msg.senderId?._id === authUser._id || msg.senderId === authUser._id 
            ? (msg.seen ? "seen" : "delivered") 
            : undefined
        }));
        
        if (selectedUser?._id === chatId) {
          if (page === 1) {
            setMessages(msgs);
          } else {
            setMessages(prev => [...msgs, ...prev]);
          }
          setPagination(data.pagination || {});
        }
      }
    } catch (error) {
      console.error("Get messages error:", error);
      if (selectedUser?._id === chatId) {
        console.error("Failed to load messages:", error.message);
      }

      if (error.name === 'AbortError') {
        console.log('Request aborted');
        return;
      }
    } finally {
      if (selectedUser?._id === chatId) {
        setIsLoadingMessages(false);
      }
    }
  }, [api, authUser, groups, selectedUser]);

  // Enhanced message sending with real-time sync
  const sendMessage = async (messageData) => {
    if (!selectedUser) {
      toast.error("No user selected");
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
      toast.error(error.response?.data?.message || "Failed to send message");
      
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      
      pendingMessagesRef.current.delete(tempId);
    }
  };

  // Enhanced group message sending with real-time sync
  const sendGroupMessage = async (messageData) => {
    if (!selectedUser || !isGroup) {
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
      receiverId: selectedUser._id,
      receiverType: 'Group',
      text: messageData.text || "",
      media: messageData.mediaUrls || [],
      fileType: fileType,
      emojis: messageData.emojis || [],
      replyTo: messageData.replyTo,
      createdAt: new Date(),
      status: "sending",
      isTemp: true
    };

    pendingMessagesRef.current.set(tempId, tempMessage);
    
    setMessages(prev => [...prev, tempMessage]);

    try {
      const postData = {
        text: messageData.text || "",
        mediaUrls: messageData.mediaUrls || [],
        fileType: fileType,
        emojis: messageData.emojis || [],
        replyTo: messageData.replyTo
      };

      console.log('📤 Sending group message:', { groupId: selectedUser._id, postData });

      const { data } = await api.post(`/api/groups/${selectedUser._id}/send`, postData);

      if (data.success) {
        console.log('✅ Group message sent successfully, server ID:', data.newMessage._id);
        
        setMessages(prev =>
          prev.map(msg =>
            msg._id === tempId
              ? { ...data.newMessage, status: "delivered" }
              : msg
          )
        );
        
        if (socket) {
          socket.emit("sendGroupMessage", {
            ...data.newMessage,
            tempId: tempId
          });
        }
        
        pendingMessagesRef.current.delete(tempId);
        
      } else {
        throw new Error(data.message || "Failed to send group message");
      }

    } catch (error) {
      console.error("❌ Send group message error:", error);
      
      if (error.response?.status === 500) {
        toast.error("Server error: Unable to send message. Please try again.");
      } else if (error.response?.status === 404) {
        toast.error("Group not found or you're not a member");
      } else {
        toast.error(error.response?.data?.message || "Failed to send group message");
      }
      
      setMessages(prev =>
        prev.map(msg =>
          msg._id === tempId ? { ...msg, status: "failed" } : msg
        )
      );
      
      pendingMessagesRef.current.delete(tempId);
    }
  };

  // Enhanced voice message sending
  const sendVoiceMessage = useCallback(async (audioBlob, receiverId, receiverType = 'User') => {
    if (!receiverId || !authUser) {
      toast.error("No receiver selected");
      return;
    }

    try {
      toast.loading('Sending voice message...');

      const base64Audio = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
      });

      const uploadRes = await api.post('/api/upload', {
        file: base64Audio,
        resourceType: 'audio'
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

  // Enhanced message reactions
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
              chatId: selectedUser._id,
              receiverType: message.receiverType,
              userId: authUser._id
            });
          }
        }
      }
    } catch (error) {
      console.error("React to message error:", error);
      toast.error("Failed to react to message");
    }
  }, [socket, authUser, messages, selectedUser, api]);

  const removeReaction = useCallback(async (messageId) => {
    if (!messageId) return;

    try {
      const { data } = await api.delete(`/api/messages/${messageId}/reaction`);
      
      if (data.success) {
        if (socket) {
          const message = messages.find(msg => msg._id === messageId);
          if (message) {
            socket.emit("reactionRemoved", {
              messageId,
              chatId: selectedUser._id,
              receiverType: message.receiverType,
              userId: authUser._id
            });
          }
        }
      }
    } catch (error) {
      console.error("Remove reaction error:", error);
      toast.error("Failed to remove reaction");
    }
  }, [socket, authUser, messages, selectedUser, api]);

  // Enhanced message editing
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
              chatId: selectedUser._id,
              receiverType: message.receiverType,
              editedAt: new Date()
            });
          }
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

  // Enhanced message deletion with authorization handling
  const deleteMessageById = async (messageId) => {
    if (!messageId) return;
    
    try {
      const { data } = await api.delete(`/api/messages/delete/${messageId}`);
      if (data.success) {
        if (socket) {
          const message = messages.find(msg => msg._id === messageId);
          if (message) {
            socket.emit("messageDeleted", {
              messageId,
              chatId: selectedUser._id,
              receiverType: message.receiverType
            });
          }
        }
        toast.success("Message deleted");
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

  // Enhanced forwarding with multiple recipients
  const forwardMessagesToUser = async (messagesToForward, recipientIds, receiverType = 'User') => {
    if (!messagesToForward.length || !recipientIds.length) {
      toast.error("No messages or recipients selected");
      return;
    }

    try {
      const { data } = await api.post("/api/messages/forward", {
        originalMessageId: messagesToForward[0]._id,
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

  // Fixed markMessagesAsSeen - Client-side only
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

      console.log(`✅ Successfully marked messages as seen locally for chat: ${chatId}`);

    } catch (error) {
      console.error("❌ Mark messages as seen error:", error);
    }
  }, [authUser, groups, socket]);

  // Download file utility
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

  // Get file icon for UI
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

  // Join group room when selecting a group
  useEffect(() => {
    if (socket && selectedUser && isGroup) {
      socket.emit("joinGroup", selectedUser._id);
    }

    return () => {
      if (socket && selectedUser && isGroup) {
        socket.emit("leaveGroup", selectedUser._id);
      }
    };
  }, [socket, selectedUser, isGroup]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <ChatContext.Provider
      value={{
        // Existing values
        messages,
        setMessages,
        users,
        groups,
        trendingChats,
        selectedUser,
        setSelectedUser,
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
        
        // Friend system values
        friends,
        friendRequests,
        sentRequests,
        getFriends,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        
        // Enhanced functions
        getUsers,
        getMyGroups,
        searchUsers,
        searchGroups,
        blockUser,
        unblockUser,
        createGroup,
        addMemberToGroup,
        removeMemberFromGroup,
        leaveGroup,
        updateGroupInfo,
        getMessage,
        sendMessage,
        sendGroupMessage,
        sendVoiceMessage,
        reactToMessage,
        removeReaction,
        editMessage,
        deleteMessageById,
        markMessagesAsSeen,
        forwardMessagesToUser,
        sendTypingStatus,
        downloadFile,
        getFileIcon,
        getFileType,
        onlineUsers,
        isGroup: !!isGroup,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};