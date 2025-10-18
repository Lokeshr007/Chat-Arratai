import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from 'prop-types';
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

// Get backend URL from environment variables with fallback
const getBackendUrl = () => {
  const devTunnelUrl = import.meta.env.VITE_BACKEND_URL;
  // Remove trailing slash if present
  return devTunnelUrl ? devTunnelUrl.replace(/\/$/, '') : 'http://localhost:5000';
};

const backendUrl = getBackendUrl();

// ✅ Set baseURL properly
axios.defaults.baseURL = backendUrl;
axios.defaults.withCredentials = true;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState(new Map());
  const [conversations, setConversations] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  
  const socketRef = useRef(null);
  const authCheckedRef = useRef(false);
  const [currentBackendUrl, setCurrentBackendUrl] = useState(backendUrl);

  // Enhanced API call function with proper URL handling
  const apiCall = useCallback(async (method, endpoint, data = null, options = {}) => {
    try {
      // Ensure endpoint starts with /api
      const url = endpoint.startsWith('/api') ? endpoint : `/api${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
      
      const config = {
        method,
        url,
        withCredentials: true,
        ...options
      };

      if (data) {
        if (method.toLowerCase() === 'get') {
          config.params = data;
        } else {
          config.data = data;
        }
      }

      console.log(`🔍 API Call: ${method} ${url} to ${currentBackendUrl}`);
      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error(`❌ API Error (${method} ${endpoint}):`, error);
      
      // Enhanced error handling
      if (error.response) {
        console.error('Error response:', error.response.data);
        if (error.response.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          setAuthUser(null);
        }
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error:', error.message);
      }
      
      throw error;
    }
  }, [currentBackendUrl]);

  // Socket connection
  const connectSocket = useCallback((userData) => {
    if (!userData || (socketRef.current && socketRef.current.connected)) {
      return;
    }

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
      socketRef.current = null;
    }

    console.log('🔌 Establishing socket connection for user:', userData._id, 'to:', currentBackendUrl);

    // ✅ Use currentBackendUrl for socket connection
    const newSocket = io(currentBackendUrl, { 
      query: { userId: userData._id },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      withCredentials: true
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      socketRef.current = newSocket;

      newSocket.emit("userOnline", { userId: userData._id });

      // Load initial data
      loadFriends();
      loadPendingRequests();
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("👥 Online users:", userIds);
      setOnlineUsers(userIds);
    });

    newSocket.on("friendRequestReceived", (data) => {
      toast.success(`Friend request from ${data.fromUser.fullName}`);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'friend_request',
        ...data,
        timestamp: new Date(),
        read: false
      }]);
      loadPendingRequests();
    });

    newSocket.on("friendRequestAccepted", (data) => {
      toast.success(`${data.acceptedUser.fullName} accepted your friend request`);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'friend_accepted',
        ...data,
        timestamp: new Date(),
        read: false
      }]);
      loadFriends();
      loadPendingRequests();
    });

    // Message events
    newSocket.on("newMessage", (messageData) => {
      console.log("📨 New message received:", messageData);
      
      const receiverId = messageData.receiverId;
      setMessages(prev => {
        const newMessages = new Map(prev);
        const existingMessages = newMessages.get(receiverId) || [];
        newMessages.set(receiverId, [...existingMessages, messageData]);
        return newMessages;
      });
    });

    newSocket.on("userStatusChanged", (data) => {
      console.log("🔄 User status changed:", data);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔌 Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      toast.error("Connection error. Please refresh the page.");
    });

    socketRef.current = newSocket;
  }, [currentBackendUrl]);

  // Load friends list
  const loadFriends = async () => {
    try {
      const data = await apiCall('get', '/users/friends');
      if (data.success) {
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Failed to load friends:", error);
    }
  };

  // Load pending friend requests
  const loadPendingRequests = async () => {
    try {
      const data = await apiCall('get', '/users/friend-requests/pending');
      if (data.success) {
        setPendingRequests(data.pendingRequests || []);
      }
    } catch (error) {
      console.error("Failed to load pending requests:", error);
    }
  };

  // Load messages for a chat
  const loadMessages = useCallback(async (chatId) => {
    try {
      const data = await apiCall('get', `/messages/${chatId}`);
      if (data.success && data.messages) {
        setMessages(prev => {
          const newMessages = new Map(prev);
          newMessages.set(chatId, data.messages);
          return newMessages;
        });
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  }, [apiCall]);

  // Send message
  const sendMessage = useCallback(async (receiverId, messageText) => {
    if (!socketRef.current) {
      toast.error("Not connected to server");
      return null;
    }

    try {
      // Optimistically add message to UI
      const tempMessage = {
        _id: `temp-${Date.now()}`,
        senderId: authUser._id,
        receiverId,
        receiverType: 'User',
        text: messageText,
        createdAt: new Date(),
        status: 'sending',
        sender: {
          _id: authUser._id,
          fullName: authUser.fullName,
          profilePic: authUser.profilePic
        }
      };

      setMessages(prev => {
        const newMessages = new Map(prev);
        const existingMessages = newMessages.get(receiverId) || [];
        newMessages.set(receiverId, [...existingMessages, tempMessage]);
        return newMessages;
      });

      // Send via API
      const data = await apiCall('post', `/messages/send/${receiverId}`, {
        text: messageText
      });

      if (data.success) {
        // Replace temp message with real one
        setMessages(prev => {
          const newMessages = new Map(prev);
          const existingMessages = newMessages.get(receiverId) || [];
          const filteredMessages = existingMessages.filter(msg => msg._id !== tempMessage._id);
          newMessages.set(receiverId, [...filteredMessages, data.newMessage]);
          return newMessages;
        });

        // Emit socket event for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit("sendMessage", {
            ...data.newMessage,
            receiverId
          });
        }

        return data.newMessage._id;
      }

      return null;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Failed to send message");
      
      // Remove temp message on error
      setMessages(prev => {
        const newMessages = new Map(prev);
        const existingMessages = newMessages.get(receiverId) || [];
        const filteredMessages = existingMessages.filter(msg => !msg._id.startsWith('temp-'));
        newMessages.set(receiverId, filteredMessages);
        return newMessages;
      });
      
      return null;
    }
  }, [authUser, apiCall]);

  // Test backend connection with fallback
  const testBackendConnection = async () => {
    const testUrl = async (url) => {
      try {
        console.log('🔍 Testing backend connection to:', url);
        // Create a temporary axios instance for testing
        const testAxios = axios.create({
          baseURL: url,
          timeout: 5000,
          withCredentials: true
        });
        
        const response = await testAxios.get('/api/status');
        console.log('✅ Backend connection successful to:', url);
        return { success: true, url, data: response.data };
      } catch (error) {
        console.log(`❌ Connection failed to ${url}:`, error.message);
        return { success: false, url, error: error.message };
      }
    };

    // Test primary URL first
    const primaryResult = await testUrl(backendUrl);
    
    if (primaryResult.success) {
      setCurrentBackendUrl(backendUrl);
      axios.defaults.baseURL = backendUrl;
      return true;
    }

    // If primary fails and it's not localhost, try localhost:5000
    if (!backendUrl.includes('localhost') && !backendUrl.includes('127.0.0.1')) {
      console.log('🔄 Trying fallback to localhost:5000...');
      const fallbackUrl = 'http://localhost:5000';
      const fallbackResult = await testUrl(fallbackUrl);
      
      if (fallbackResult.success) {
        setCurrentBackendUrl(fallbackUrl);
        axios.defaults.baseURL = fallbackUrl;
        toast.success(`Connected to local server: ${fallbackUrl}`);
        return true;
      }
    }

    console.log('💡 Make sure your backend is running at:', backendUrl);
    if (!backendUrl.includes('localhost')) {
      console.log('💡 Or try running on localhost:5000');
    }
    return false;
  };

  // Enhanced login function
  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      const data = await apiCall('post', '/users/login', credentials);
      
      if (data.success) {
        const userData = data.userData || data.user;
        
        setAuthUser(userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        
        connectSocket(userData);
        
        toast.success(data.message);
        return { success: true, userData, token: data.token };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      let errMsg = err.response?.data?.message || err.message || "Login failed";
      
      if (err.response?.data?.needsVerification) {
        return { 
          success: false, 
          message: errMsg,
          needsVerification: true,
          email: credentials.email
        };
      }
      
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced signup function
  const signup = async (credentials) => {
    try {
      setIsLoading(true);
      const data = await apiCall('post', '/users/signup', credentials);
      
      if (data.success) {
        toast.success(data.message);
        return { 
          success: true, 
          message: data.message,
          needsVerification: true 
        };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || "Signup failed";
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout function
  const logout = useCallback(() => {
    if (socketRef.current && authUser) {
      socketRef.current.emit("userOffline", { userId: authUser._id });
    }

    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    setNotifications([]);
    setMessages(new Map());
    setConversations([]);
    setFriends([]);
    setPendingRequests([]);
    delete axios.defaults.headers.common["Authorization"];
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    
    toast.success("Logged out successfully");
  }, [authUser]);

  // Enhanced auth check
  const checkAuth = useCallback(async () => {
    if (authCheckedRef.current) return;
    authCheckedRef.current = true;

    const storedToken = localStorage.getItem("token");
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    try {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
      
      const data = await apiCall('get', '/users/check');
      
      if (data.success) {
        setAuthUser(data.user);
        if (!socketRef.current || !socketRef.current.connected) {
          connectSocket(data.user);
        }
      } else {
        logout();
      }
    } catch (err) {
      console.error("Auth check error:", err);
      logout();
    } finally {
      setIsLoading(false);
    }
  }, [logout, connectSocket, apiCall]);

  // Friend management functions
  const sendFriendRequestByEmail = async (email) => {
    try {
      const data = await apiCall('post', '/users/friend-request/email', { email });
      if (data.success) {
        toast.success("Friend request sent");
        
        if (socketRef.current) {
          socketRef.current.emit("friendRequest", {
            toUserId: data.request.toUserId,
            fromUser: authUser,
            requestId: data.request._id
          });
        }
        
        return data;
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const acceptFriendRequest = async (requestId) => {
    try {
      const data = await apiCall('put', `/users/friend-request/accept/${requestId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Friend request accepted");
        
        if (socketRef.current) {
          socketRef.current.emit("friendRequestAccepted", {
            fromUserId: data.friendRequest.fromUserId,
            acceptedUser: authUser
          });
        }
        
        loadFriends();
        loadPendingRequests();
        
        return data;
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const rejectFriendRequest = async (requestId) => {
    try {
      const data = await apiCall('put', `/users/friend-request/reject/${requestId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Friend request rejected");
        loadPendingRequests();
        return data;
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const removeFriend = async (friendId) => {
    try {
      const data = await apiCall('delete', `/users/friend/${friendId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Friend removed");
        loadFriends();
        return data;
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Search users (only non-friends)
  const searchUsers = async (query) => {
    try {
      const data = await apiCall('get', `/users/search?query=${encodeURIComponent(query)}`);
      if (data.success) {
        return data.users || [];
      }
      return [];
    } catch (err) {
      console.error("Search users error:", err);
      return [];
    }
  };

  // Get users for sidebar (only friends)
  const getChatUsers = async () => {
    try {
      const data = await apiCall('get', "/messages/users");
      if (data.success) {
        return data.users || [];
      }
      return [];
    } catch (err) {
      console.error("Get chat users error:", err);
      return [];
    }
  };

  // Clear notifications
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Resend verification email with email parameter
  const resendVerification = async (email) => {
    try {
      setIsLoading(true);
      
      const data = await apiCall('post', '/users/resend-verification', { email });
      
      if (data.success) {
        toast.success("Verification email sent! Please check your inbox.");
        return { success: true, message: data.message };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to resend verification email";
      console.error("Resend verification error:", error);
      toast.error(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    // Test connection first with fallback
    testBackendConnection().then(success => {
      if (success) {
        checkAuth();
      } else {
        setIsLoading(false);
        toast.error(`Cannot connect to backend server. Tried: ${backendUrl} and localhost:5000`);
      }
    });
  }, [checkAuth]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);
  
  const value = {
    // Auth state
    api: axios,
    authUser,
    onlineUsers,
    socket: socketRef.current,
    token,
    isLoading,
    notifications,
    messages,
    conversations,
    friends,
    pendingRequests,
    currentBackendUrl, // Expose current backend URL for debugging
    
    // Auth functions
    login,
    signup,
    logout,
    checkAuth,
    
    // Message functions
    sendMessage,
    loadMessages,
    
    // Friend system
    sendFriendRequestByEmail,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    loadFriends,
    loadPendingRequests,
    searchUsers,
    getChatUsers,
    resendVerification,
    
    // Notifications
    clearNotification,
    markNotificationAsRead,
    clearAllNotifications,
    
    // Update auth user
    updateAuthUser: setAuthUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};