import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import { Server } from "socket.io";

// Initialize app and server
const app = express();
const server = http.createServer(app);

// Initialize Socket.IO server
// In server.js - Update socket configuration
export const io = new Server(server, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
  },
  pingTimeout: 60000,        // Increase timeout
  pingInterval: 25000,       // Increase interval
  connectionStateRecovery: {
    // Enable connection state recovery
    maxDisconnectionDuration: 2 * 60 * 1000, // 2 minutes
    skipMiddlewares: true,
  },
  transports: ['websocket', 'polling'], // Specify transports
});

// (Socket connection handling consolidated further down in this file.)

// Online users mapping
export const userSocketMap = {};

// ✅ Socket.IO connection
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User Connected:", userId, "Socket ID:", socket.id);

  // 🆕 Validation for userId
  if (userId && typeof userId === 'string') {
    userSocketMap[userId] = socket.id;
    
    // Notify all clients about online users
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    // Notify friends that user is online
    socket.broadcast.emit("userStatusChanged", {
      userId,
      status: "online",
      lastSeen: new Date()
    });
  } else {
    console.warn("⚠️ Invalid userId on connection:", userId);
  }

  // 📩 Private message handler
  socket.on("sendMessage", (msg) => {
    try {
      const receiverSocketId = userSocketMap[msg.receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", msg);
      }
    } catch (error) {
      console.error("❌ Error in sendMessage:", error);
    }
  });

  // 👥 Group message handler
  socket.on("sendGroupMessage", (msg) => {
    try {
      if (msg.groupId) {
        socket.to(`group_${msg.groupId}`).emit("newGroupMessage", msg);
      }
    } catch (error) {
      console.error("❌ Error in sendGroupMessage:", error);
    }
  });

  // 👀 Seen message handler
  socket.on("messageSeen", (data) => {
    try {
      const senderSocketId = userSocketMap[data.senderId];
      if (senderSocketId) {
        io.to(senderSocketId).emit("messageSeen", data);
      }
    } catch (error) {
      console.error("❌ Error in messageSeen:", error);
    }
  });

  // 🆕 Message reaction handler
  socket.on("messageReaction", (data) => {
    try {
      const { senderId, chatId, receiverType } = data || {};

      if (receiverType === 'User') {
        // Private chat - notify both users (sender and chatId)
        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[chatId];

        if (senderSocketId) io.to(senderSocketId).emit("messageReaction", data);
        if (receiverSocketId) io.to(receiverSocketId).emit("messageReaction", data);
      } else {
        // Group chat - notify all group members
        socket.to(`group_${chatId}`).emit("messageReaction", data);
      }
    } catch (error) {
      console.error("❌ Error in messageReaction:", error);
    }
  });

  // 🆕 Reaction removed handler
  socket.on("reactionRemoved", (data) => {
    try {
      const { senderId, chatId, receiverType } = data || {};

      if (receiverType === 'User') {
        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[chatId];

        if (senderSocketId) io.to(senderSocketId).emit("reactionRemoved", data);
        if (receiverSocketId) io.to(receiverSocketId).emit("reactionRemoved", data);
      } else {
        socket.to(`group_${chatId}`).emit("reactionRemoved", data);
      }
    } catch (error) {
      console.error("❌ Error in reactionRemoved:", error);
    }
  });

  // 🆕 Message edited handler
  socket.on("messageEdited", (data) => {
    try {
      const { senderId, chatId, receiverType } = data || {};

      if (receiverType === 'User') {
        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[chatId];

        if (senderSocketId) io.to(senderSocketId).emit("messageEdited", data);
        if (receiverSocketId) io.to(receiverSocketId).emit("messageEdited", data);
      } else {
        socket.to(`group_${chatId}`).emit("messageEdited", data);
      }
    } catch (error) {
      console.error("❌ Error in messageEdited:", error);
    }
  });

  // 🆕 Message deleted handler
  socket.on("messageDeleted", (data) => {
    try {
      const { senderId, chatId, receiverType } = data || {};

      if (receiverType === 'User') {
        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[chatId];

        if (senderSocketId) io.to(senderSocketId).emit("messageDeleted", data);
        if (receiverSocketId) io.to(receiverSocketId).emit("messageDeleted", data);
      } else {
        socket.to(`group_${chatId}`).emit("messageDeleted", data);
      }
    } catch (error) {
      console.error("❌ Error in messageDeleted:", error);
    }
  });

  // ✍️ Typing indicators for private chats
  socket.on("typing", ({ receiverId, isTyping }) => {
    try {
      if (receiverId && userId) {
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("typing", { 
            senderId: userId, 
            isTyping,
            timestamp: new Date()
          });
        }
      }
    } catch (error) {
      console.error("❌ Error in typing:", error);
    }
  });

  // 🆕 Group typing indicators
  socket.on("groupTyping", ({ groupId, isTyping, userName }) => {
    try {
      if (groupId && userId) {
        socket.to(`group_${groupId}`).emit("groupTyping", { 
          userId,
          userName: userName || userId,
          isTyping,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in groupTyping:", error);
    }
  });

  // 🧩 Join group rooms for group chat
  socket.on("joinGroup", (groupId) => {
    try {
      if (groupId && userId) {
        socket.join(`group_${groupId}`);
        console.log(`👥 User ${userId} joined group ${groupId}`);
        
        // Notify group members about new member joining (for real-time updates)
        socket.to(`group_${groupId}`).emit("userJoinedGroup", {
          groupId,
          userId,
          joinedAt: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in joinGroup:", error);
    }
  });

  // 🆕 Leave group room
  socket.on("leaveGroup", (groupId) => {
    try {
      if (groupId && userId) {
        socket.leave(`group_${groupId}`);
        console.log(`👥 User ${userId} left group ${groupId}`);
        
        // Notify group members
        socket.to(`group_${groupId}`).emit("userLeftGroup", {
          groupId,
          userId,
          leftAt: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in leaveGroup:", error);
    }
  });

  // 🆕 Chat cleared handler - notify other participant(s)
  socket.on("chatCleared", (data) => {
    try {
      const { chatId, userId, receiverType } = data || {};

      // If receiverType is 'Group' or if server can detect group membership, emit to group
      if (receiverType === 'Group') {
        socket.to(`group_${chatId}`).emit('chatCleared', { chatId, userId, timestamp: new Date() });
        return;
      }

      // For private chats: chatId is the other user's id
      const otherSocketId = userSocketMap[chatId];
      if (otherSocketId) {
        io.to(otherSocketId).emit('chatCleared', { chatId, userId, timestamp: new Date() });
      }
    } catch (error) {
      console.error('❌ Error handling chatCleared socket event:', error);
    }
  });

  // 🆕 Friend request handler
  socket.on("friendRequest", (data) => {
    try {
      const { toUserId, fromUser } = data;
      const receiverSocketId = userSocketMap[toUserId];
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("friendRequestReceived", {
          fromUser,
          requestId: data.requestId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in friendRequest:", error);
    }
  });

  // 🆕 Friend request accepted handler
  socket.on("friendRequestAccepted", (data) => {
    try {
      const { fromUserId, acceptedUser } = data;
      const senderSocketId = userSocketMap[fromUserId];
      
      if (senderSocketId) {
        io.to(senderSocketId).emit("friendRequestAccepted", {
          acceptedUser,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in friendRequestAccepted:", error);
    }
  });

  // 🆕 User blocked handler
  socket.on("userBlocked", (data) => {
    try {
      const { blockedUserId, blockedBy } = data;
      const blockedUserSocketId = userSocketMap[blockedUserId];
      
      if (blockedUserSocketId) {
        io.to(blockedUserSocketId).emit("youWereBlocked", {
          blockedBy,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in userBlocked:", error);
    }
  });

  // 🆕 User unblocked handler
  socket.on("userUnblocked", (data) => {
    try {
      const { unblockedUserId, unblockedBy } = data;
      const unblockedUserSocketId = userSocketMap[unblockedUserId];
      
      if (unblockedUserSocketId) {
        io.to(unblockedUserSocketId).emit("youWereUnblocked", {
          unblockedBy,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in userUnblocked:", error);
    }
  });

  // 🆕 Call initiation handler
  socket.on("initiateCall", (data) => {
    try {
      const { receiverId, callType, callId } = data;
      const receiverSocketId = userSocketMap[receiverId];
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("incomingCall", {
          callId,
          callerId: userId,
          callType,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in initiateCall:", error);
    }
  });

  // 🆕 Call response handler
  socket.on("callResponse", (data) => {
    try {
      const { callerId, callId, accepted, reason } = data;
      const callerSocketId = userSocketMap[callerId];
      
      if (callerSocketId) {
        io.to(callerSocketId).emit("callResponded", {
          callId,
          accepted,
          reason,
          respondentId: userId,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error("❌ Error in callResponse:", error);
    }
  });

  // 🆕 Call end handler
  socket.on("endCall", (data) => {
    try {
      const { callId, participantIds } = data;
      
      participantIds.forEach(participantId => {
        const participantSocketId = userSocketMap[participantId];
        if (participantSocketId) {
          io.to(participantSocketId).emit("callEnded", {
            callId,
            endedBy: userId,
            timestamp: new Date()
          });
        }
      });
    } catch (error) {
      console.error("❌ Error in endCall:", error);
    }
  });

  // ❌ Disconnect handler
  socket.on("disconnect", (reason) => {
    console.log("❌ User Disconnected:", userId, "Reason:", reason);
    
    if (userId) {
      delete userSocketMap[userId];
      
      // Notify all clients about updated online users
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      
      // Notify friends that user went offline
      socket.broadcast.emit("userStatusChanged", {
        userId,
        status: "offline",
        lastSeen: new Date()
      });
    }
  });

  // 🆕 Error handler for socket
  socket.on("error", (error) => {
    console.error("❌ Socket error for user", userId, ":", error);
  });
});

// Middleware setup
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true
}));
app.use(express.json({ limit: "50mb" })); // large limit for media uploads
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Test route
app.get("/api/status", (req, res) => res.json({ 
  success: true, 
  message: "🚀 Server is Live and Ready",
  timestamp: new Date(),
  onlineUsers: Object.keys(userSocketMap).length
}));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    onlineUsers: Object.keys(userSocketMap).length
  });
});

// ✅ FIXED: Routers with consistent paths
app.use("/api/users", userRouter);  // Changed from /api/auth to /api/users
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
app.use("/api/upload", uploadRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Global error handler:", error);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// Connect DB with error handling
try {
  await connectDB();
  console.log("✅ Database connected successfully!");
} catch (error) {
  console.error("❌ Database connection failed:", error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

// Start server
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`📡 API Routes:`);
  console.log(`   - Users: /api/users/*`);
  console.log(`   - Messages: /api/messages/*`);
  console.log(`   - Groups: /api/groups/*`);
  console.log(`   - Upload: /api/upload/*`);
});