// routes/userRoutes.js - Updated imports
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
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getUserMedia,
  deleteAccount,
  verifyEmail
} from "../controllers/AuthController.js";
import { protectRoute, checkAuth } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.post("/signup", signup);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);

// Protected routes
router.get("/check", protectRoute, checkAuth);
router.put("/change-password", protectRoute, changePassword);
router.put("/profile", protectRoute, updateProfile);

// User management routes
router.get("/profile/:userId", protectRoute, getUserProfile);
router.get("/search", protectRoute, searchUsers);

// Friend management routes
router.get("/friends", protectRoute, getFriends);
router.post("/friend-request/:userId", protectRoute, sendFriendRequest);
router.put("/friend-request/accept/:userId", protectRoute, acceptFriendRequest);
router.put("/friend-request/reject/:userId", protectRoute, rejectFriendRequest);
router.delete("/friend/:userId", protectRoute, removeFriend);

// Block/Unblock routes
router.put("/block/:userId", protectRoute, blockUser);
router.put("/unblock/:userId", protectRoute, unblockUser);

// Media routes
router.get("/media/:userId", protectRoute, getUserMedia);

// Account management
router.delete("/account", protectRoute, deleteAccount);

export default router;