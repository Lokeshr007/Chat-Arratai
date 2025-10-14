import express from "express";
import {
  createGroup,
  getMyGroups,
  getGroupMessages,
  sendGroupMessage,
  addMemberToGroup,
  removeMemberFromGroup,
  deleteGroup,
  getGroupDetails,
  updateGroupInfo,
  transferGroupAdmin,
  searchGroups,
  leaveGroup
} from "../controllers/groupController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Group management
router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getMyGroups);
router.get("/search", protectRoute, searchGroups);
router.get("/:groupId", protectRoute, getGroupDetails);
router.put("/:groupId", protectRoute, updateGroupInfo);
router.delete("/:groupId", protectRoute, deleteGroup);

// Group messaging
router.get("/:groupId/messages", protectRoute, getGroupMessages);
router.post("/:groupId/send", protectRoute, sendGroupMessage);

// Member management
router.post("/:groupId/add", protectRoute, addMemberToGroup);
router.delete("/:groupId/remove/:memberId", protectRoute, removeMemberFromGroup);
router.post("/:groupId/leave", protectRoute, leaveGroup);

// For group chats
router.get('/api/groups/:groupId/pinned-messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Mock response - replace with actual database query
    res.json({
      success: true,
      pinnedMessages: [] // Return empty array for now
    });
  } catch (error) {
    console.error('Error fetching group pinned messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pinned messages'
    });
  }
});

// Admin management
router.put("/:groupId/transfer-admin", protectRoute, transferGroupAdmin);

export default router;