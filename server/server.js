import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import groupRouter from "./routes/groupRoutes.js";
import uploadRouter from "./routes/uploadRoutes.js";
import settingsRoutes from './routes/settingsRoutes.js';


dotenv.config();

const app = express();
const server = http.createServer(app);


// In your main server file (index.js or app.js)

// Add this with your other routes
app.use('/api/users', settingsRoutes);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'https://localhost:5173',
  'http://127.0.0.1:5173',
  'https://5d4xmbxq-5173.inc1.devtunnels.ms',
  'https://5d4xmbxq-5000.inc1.devtunnels.ms',
].filter(Boolean);

console.log('🔗 Allowed CORS origins:', allowedOrigins);

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // For development, allow all origins
      if (process.env.NODE_ENV === 'development') {
        console.log('⚠️  Allowing origin in development:', origin);
        return callback(null, true);
      }
      console.log('🔒 CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Device-Type'
  ],
  exposedHeaders: [
    'Access-Control-Allow-Origin',
    'Access-Control-Allow-Credentials'
  ],
  maxAge: 86400
};

// Apply CORS middleware FIRST - this is crucial
app.use(cors(corsOptions));

// Manual CORS middleware for ALL requests
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Always set CORS headers
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV === 'development') {
    // In development, allow any origin
    res.header('Access-Control-Allow-Origin', origin || '*');
  }
  
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Access-Control-Request-Method, Access-Control-Request-Headers');
  
  // Security headers
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  
  // Handle preflight requests - THIS IS THE KEY FIX
  if (req.method === 'OPTIONS') {
    console.log('🛫 Handling preflight request for:', req.url);
    return res.status(200).end();
  }
  
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
  transports: ['websocket', 'polling'],
  allowEIO3: true,
});

const userSocketMap = {};

// Socket.IO connection handling (your existing socket code)
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("✅ User Connected:", userId, "Socket ID:", socket.id, "From:", socket.handshake.headers.origin);

  if (userId && typeof userId === 'string') {
    userSocketMap[userId] = socket.id;
    
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
    
    socket.broadcast.emit("userStatusChanged", {
      userId,
      status: "online",
      lastSeen: new Date()
    });
  } else {
    console.warn("⚠️ Invalid userId on connection:", userId);
  }

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

  socket.on("sendGroupMessage", (msg) => {
    try {
      if (msg.groupId) {
        socket.to(`group_${msg.groupId}`).emit("newGroupMessage", msg);
      }
    } catch (error) {
      console.error("❌ Error in sendGroupMessage:", error);
    }
  });

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

  socket.on("messageReaction", (data) => {
    try {
      const { senderId, chatId, receiverType } = data || {};

      if (receiverType === 'User') {
        const senderSocketId = userSocketMap[senderId];
        const receiverSocketId = userSocketMap[chatId];

        if (senderSocketId) io.to(senderSocketId).emit("messageReaction", data);
        if (receiverSocketId) io.to(receiverSocketId).emit("messageReaction", data);
      } else {
        socket.to(`group_${chatId}`).emit("messageReaction", data);
      }
    } catch (error) {
      console.error("❌ Error in messageReaction:", error);
    }
  });

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

  socket.on("joinGroup", (groupId) => {
    try {
      if (groupId && userId) {
        socket.join(`group_${groupId}`);
        console.log(`👥 User ${userId} joined group ${groupId}`);
        
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

  socket.on("leaveGroup", (groupId) => {
    try {
      if (groupId && userId) {
        socket.leave(`group_${groupId}`);
        console.log(`👥 User ${userId} left group ${groupId}`);
        
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

  socket.on("chatCleared", (data) => {
    try {
      const { chatId, userId, receiverType } = data || {};

      if (receiverType === 'Group') {
        socket.to(`group_${chatId}`).emit('chatCleared', { chatId, userId, timestamp: new Date() });
        return;
      }

      const otherSocketId = userSocketMap[chatId];
      if (otherSocketId) {
        io.to(otherSocketId).emit('chatCleared', { chatId, userId, timestamp: new Date() });
      }
    } catch (error) {
      console.error('❌ Error handling chatCleared socket event:', error);
    }
  });

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

  socket.on("disconnect", (reason) => {
    console.log("❌ User Disconnected:", userId, "Reason:", reason);
    
    if (userId) {
      delete userSocketMap[userId];
      
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
      
      socket.broadcast.emit("userStatusChanged", {
        userId,
        status: "offline",
        lastSeen: new Date()
      });
    }
  });

  socket.on("error", (error) => {
    console.error("❌ Socket error for user", userId, ":", error);
  });
});

// Attach Socket.IO to requests
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Test route - ensure no redirects
app.get("/api/status", (req, res) => {
  console.log('📡 Status endpoint hit from origin:', req.headers.origin);
  res.json({ 
    success: true, 
    message: "🚀 Server is Live and Ready",
    timestamp: new Date(),
    onlineUsers: Object.keys(userSocketMap).length,
    allowedOrigins: allowedOrigins,
    clientIP: req.ip,
    userAgent: req.headers['user-agent'],
    backendURL: 'https://5d4xmbxq-5000.inc1.devtunnels.ms',
    frontendURL: 'https://5d4xmbxq-5173.inc1.devtunnels.ms'
  });
});

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    onlineUsers: Object.keys(userSocketMap).length,
    allowedOrigins: allowedOrigins
  });
});

// API routes
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/groups", groupRouter);
app.use("/api/upload", uploadRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
    availableRoutes: [
      '/api/status',
      '/api/health',
      '/api/users/*',
      '/api/messages/*',
      '/api/groups/*',
      '/api/upload/*'
    ]
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("🚨 Global error handler:", error);
  
  // Set CORS headers even for errors
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle CORS errors specifically
  if (error.message === 'Not allowed by CORS') {
    return res.status(403).json({
      success: false,
      message: "CORS policy: Origin not allowed",
      yourOrigin: req.headers.origin,
      allowedOrigins: allowedOrigins,
      tip: "Make sure your frontend is using: https://5d4xmbxq-5173.inc1.devtunnels.ms"
    });
  }
  
  res.status(500).json({
    success: false,
    message: "Internal server error",
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// In your main server file (index.js or app.js)

// Server startup
const startServer = async () => {
  try {
    await connectDB();
    console.log("✅ Database connected successfully!");
    
    const PORT = process.env.PORT || 5000;

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Backend URL: https://5d4xmbxq-5000.inc1.devtunnels.ms`);
      console.log(`🔗 Frontend URL: https://5d4xmbxq-5173.inc1.devtunnels.ms`);
      console.log(`📱 Mobile access enabled via DevTunnels`);
      console.log(`🔗 CORS enabled for:`, allowedOrigins);
      console.log(`📡 API Status: https://5d4xmbxq-5000.inc1.devtunnels.ms/api/status`);
    });
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

startServer();

export { io, userSocketMap };