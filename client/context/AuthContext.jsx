import { createContext, useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [authUser, setAuthUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  
  const socketRef = useRef(null);
  const authCheckedRef = useRef(false);

  // Enhanced login function
  const login = async (state, credentials) => {
    try {
      setIsLoading(true);
      const { data } = await axios.post(`/api/auth/${state}`, credentials);
      
      if (data.success) {
        setAuthUser(data.userData);
        setToken(data.token);
        localStorage.setItem("token", data.token);
        axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        
        // Connect socket with enhanced configuration
        connectSocket(data.userData);
        
        toast.success(data.message);
        return data;
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced logout function
  const logout = useCallback(() => {
    // Emit offline status before disconnecting
    if (socketRef.current && authUser) {
      socketRef.current.emit("userOffline", { userId: authUser._id });
    }

    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    setNotifications([]);
    delete axios.defaults.headers.common["Authorization"];
    
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
    }
    
    toast.success("Logged out successfully");
  }, [authUser]);

  // Enhanced socket connection
  const connectSocket = useCallback((userData) => {
    if (!userData || (socketRef.current && socketRef.current.connected)) return;

    // Clean up existing socket
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current.removeAllListeners();
    }

    const newSocket = io(backendUrl, { 
      query: { userId: userData._id },
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setSocket(newSocket);
      socketRef.current = newSocket;
      
      // Emit user online event
      newSocket.emit("userOnline", { userId: userData._id });
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    newSocket.on("userStatusChanged", (data) => {
      console.log("User status changed:", data);
      // You can update friend status here if needed
    });

    newSocket.on("friendRequestReceived", (data) => {
      toast.success(`Friend request from ${data.fromUser.fullName}`);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'friend_request',
        ...data,
        timestamp: new Date()
      }]);
    });

    newSocket.on("friendRequestAccepted", (data) => {
      toast.success(`${data.acceptedUser.fullName} accepted your friend request`);
      setNotifications(prev => [...prev, {
        id: Date.now(),
        type: 'friend_accepted',
        ...data,
        timestamp: new Date()
      }]);
    });

    newSocket.on("youWereBlocked", (data) => {
      toast.error(`You were blocked by ${data.blockedBy.fullName}`);
    });

    newSocket.on("youWereUnblocked", (data) => {
      toast.success(`You were unblocked by ${data.unblockedBy.fullName}`);
    });

    newSocket.on("incomingCall", (data) => {
      setNotifications(prev => [...prev, {
        id: data.callId,
        type: 'incoming_call',
        ...data,
        timestamp: new Date()
      }]);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connect error:", err);
      toast.error("Connection error. Please refresh.");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      if (reason === "io server disconnect") {
        // Server forced disconnect, try to reconnect
        newSocket.connect();
      }
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  }, []);

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
      const { data } = await axios.get("/api/auth/check");
      
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
  }, [logout, connectSocket]);

  // Friend management functions
  const sendFriendRequest = async (userId) => {
    try {
      const { data } = await axios.post(`/api/auth/friend-request/${userId}`);
      if (data.success) {
        toast.success("Friend request sent");
        
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit("friendRequest", {
            toUserId: userId,
            fromUser: authUser,
            requestId: data.requestId
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

  const acceptFriendRequest = async (userId) => {
    try {
      const { data } = await axios.put(`/api/auth/friend-request/accept/${userId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Friend request accepted");
        
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit("friendRequestAccepted", {
            fromUserId: userId,
            acceptedUser: authUser
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

  const rejectFriendRequest = async (userId) => {
    try {
      const { data } = await axios.put(`/api/auth/friend-request/reject/${userId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Friend request rejected");
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

  const removeFriend = async (userId) => {
    try {
      const { data } = await axios.delete(`/api/auth/friend/${userId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Friend removed");
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

  const getFriends = async () => {
    try {
      const { data } = await axios.get("/api/auth/friends");
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Enhanced block/unblock with socket events
  const blockUser = async (userId) => {
    try {
      const { data } = await axios.put(`/api/auth/block/${userId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("User blocked successfully");
        
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit("userBlocked", {
            blockedUserId: userId,
            blockedBy: authUser
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

  const unblockUser = async (userId) => {
    try {
      const { data } = await axios.put(`/api/auth/unblock/${userId}`);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("User unblocked successfully");
        
        // Emit socket event
        if (socketRef.current) {
          socketRef.current.emit("userUnblocked", {
            unblockedUserId: userId,
            unblockedBy: authUser
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

  // Call management functions
  const initiateCall = (receiverId, callType = 'audio') => {
    if (!socketRef.current) return null;
    
    const callId = `call_${Date.now()}`;
    socketRef.current.emit("initiateCall", {
      receiverId,
      callType,
      callId,
      caller: authUser
    });
    
    return callId;
  };

  const respondToCall = (callId, callerId, accepted, reason = '') => {
    if (socketRef.current) {
      socketRef.current.emit("callResponse", {
        callId,
        callerId,
        accepted,
        reason
      });
    }
  };

  const endCall = (callId, participantIds) => {
    if (socketRef.current) {
      socketRef.current.emit("endCall", {
        callId,
        participantIds
      });
    }
  };

  // Clear notifications
  const clearNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  // Existing auth functions (forgotPassword, resetPassword, changePassword, updateProfile)
  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post("/api/auth/forgot-password", { email });
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const resetPassword = async (credentials) => {
    try {
      const { data } = await axios.put("/api/auth/reset-password", credentials);
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const changePassword = async (credentials) => {
    try {
      const { data } = await axios.put("/api/auth/change-password", credentials);
      if (data.success) toast.success(data.message);
      else toast.error(data.message);
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/auth/profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success(data.message || "Profile updated successfully");
      } else {
        toast.error(data.message);
      }
      return data;
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      toast.error(errMsg);
      return { success: false, message: errMsg };
    }
  };

  // Effects
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const value = {
    api: axios,
    authUser,
    onlineUsers,
    socket: socketRef.current,
    token,
    isLoading,
    notifications,
    login,
    logout,
    updateProfile,
    forgotPassword,
    resetPassword,
    changePassword,
    checkAuth,
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    getFriends,
    blockUser,
    unblockUser,
    initiateCall,
    respondToCall,
    endCall,
    clearNotification,
    clearAllNotifications
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};