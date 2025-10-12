import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getFriendsAndRequests,
  sendFriendRequest,
  respondFriendRequest,
  blockUser,
  unblockUser
} from "../controllers/friendController.js";

const router = express.Router();

router.get("/friends", protectRoute, getFriendsAndRequests);
router.post("/request/:userId", protectRoute, sendFriendRequest);
router.post("/request/respond", protectRoute, respondFriendRequest);
router.post("/block/:userId", protectRoute, blockUser);
router.post("/unblock/:userId", protectRoute, unblockUser);

export default router;
