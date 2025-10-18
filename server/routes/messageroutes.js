// routes/messageRoutes.js
import express from "express";
import {
  getUsersForSidebar,
  getMessages,
  markMessageAsSeen,
  sendMessage,
  deleteMessageById,
  clearChatWithUser,
  sendMediaMessage,
  forwardMessage,
  addReaction,
  removeReaction,
  editMessage,
  getMessageReactions,
  markChatAsSeen
} from "../controllers/messageController.js";
import { protectRoute } from "../middleware/auth.js";

const messageRouter = express.Router();

// Get sidebar users
messageRouter.get("/users", protectRoute, getUsersForSidebar);

// Get messages
messageRouter.get("/:id", protectRoute, getMessages);

// Mark message as seen
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

// Mark chat as seen
messageRouter.put("/mark-chat/:chatId", protectRoute, markChatAsSeen);

// Send text message
messageRouter.post("/send/:id", protectRoute, sendMessage);

// Send media message
messageRouter.post("/send-media/:id", protectRoute, sendMediaMessage);

// Message reactions
messageRouter.post("/:id/reaction", protectRoute, addReaction);
messageRouter.delete("/:id/reaction", protectRoute, removeReaction);
messageRouter.get("/:id/reactions", protectRoute, getMessageReactions);

// Edit message
messageRouter.put("/:id/edit", protectRoute, editMessage);

// Delete single message
messageRouter.delete("/delete/:id", protectRoute, deleteMessageById);

// CLEAR ENTIRE CHAT (PERMANENT DELETE)
messageRouter.delete("/clear/:id", protectRoute, clearChatWithUser);

// Forward message
messageRouter.post("/forward", protectRoute, forwardMessage);

export default messageRouter;