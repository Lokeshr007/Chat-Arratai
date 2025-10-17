// routes/userRoutes.js - FIXED VERSION
import express from "express";
import {
  signup,
  login,
  forgotPassword,
  resetPassword,
  changePassword,
  updateProfile,
  blockUser,
  unblockUser,
  getUserProfile,
  searchUsers,
  sendFriendRequestByEmail,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getUserMedia,
  deleteAccount,
  verifyEmail,
  resendVerification,
  getPendingRequests,
  sendFriendRequest,
  resendVerificationEmail
} from "../controllers/AuthController.js";
import { protectRoute, checkAuth } from "../middleware/auth.js";
import User from "../models/User.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerification);
router.post('/resend-verification-email', resendVerificationEmail);

// Protected routes
router.get("/check", protectRoute, checkAuth);
router.put("/change-password", protectRoute, changePassword);
router.put("/profile", protectRoute, updateProfile);

// User management routes
router.get("/profile/:userId", protectRoute, getUserProfile);
router.get("/search", protectRoute, searchUsers);

// Friend management routes
router.get("/friends", protectRoute, getFriends);
router.get("/friend-requests/pending", protectRoute, getPendingRequests);
router.post("/friend-request/email", protectRoute, sendFriendRequestByEmail);
router.put("/friend-request/accept/:requestId", protectRoute, acceptFriendRequest);
router.put("/friend-request/reject/:requestId", protectRoute, rejectFriendRequest);
router.delete("/friend/:friendId", protectRoute, removeFriend);
router.post("/friend-request/:userId", protectRoute, sendFriendRequest);

// Search users by email route
router.get('/search/email', protectRoute, async (req, res) => {
  try {
    const { email } = req.query;
    const currentUserId = req.user._id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Search users by email
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: currentUserId },
      status: 'active'
    }).select('fullName username email profilePic lastSeen privacySettings');

    // Apply privacy filters
    const currentUser = await User.findById(currentUserId);
    const filteredUsers = users.map(user => {
      const userObj = user.toObject();
      const isFriend = currentUser.friends.some(
        friend => friend.user.toString() === user._id.toString()
      );
      
      const hasSentRequest = currentUser.sentFriendRequests.some(
        req => req.to.toString() === user._id.toString() && req.status === 'pending'
      );

      const hasReceivedRequest = currentUser.friendRequests.some(
        req => req.from.toString() === user._id.toString() && req.status === 'pending'
      );

      return {
        _id: userObj._id,
        fullName: userObj.fullName,
        username: userObj.username,
        email: userObj.email,
        profilePic: userObj.profilePic,
        lastSeen: userObj.lastSeen,
        isFriend,
        friendshipStatus: isFriend ? 'friends' : 
                         hasSentRequest ? 'request_sent' : 
                         hasReceivedRequest ? 'request_received' : 'not_friends',
        hasSentRequest,
        hasReceivedRequest,
        canSendRequest: user.privacySettings?.friendRequests !== 'nobody'
      };
    });

    res.json({
      success: true,
      users: filteredUsers,
      count: filteredUsers.length
    });

  } catch (error) {
    console.error("Search users by email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

// Friend request routes
router.post("/friend-request/:userId", protectRoute, sendFriendRequest);

// Block/Unblock routes
router.put("/block/:userId", protectRoute, blockUser);
router.put("/unblock/:userId", protectRoute, unblockUser);

// Media routes
router.get("/media/:userId", protectRoute, getUserMedia);

// Account management
router.delete("/account", protectRoute, deleteAccount);

// Friends sidebar route
router.get('/friends/sidebar', protectRoute, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('friends.user', 'fullName username profilePic lastSeen email privacySettings')
      .populate('friendRequests.from', 'fullName username profilePic');

    // Only return friends for sidebar
    const friends = currentUser.friends.map(friend => ({
      ...friend.user.toObject(),
      friendshipDate: friend.addedAt,
      canChat: true
    }));

    res.json({
      success: true,
      friends,
      unseenMessages: {}
    });

  } catch (error) {
    console.error("Get friends for sidebar error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

export default router;