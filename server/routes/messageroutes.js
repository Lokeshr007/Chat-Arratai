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

// Get sidebar users (recent chats)
messageRouter.get("/users", protectRoute, getUsersForSidebar);

// Get messages of a user or group (id can be userId or groupId)
messageRouter.get("/:id", protectRoute, getMessages);

// Mark a message as seen
messageRouter.put("/mark/:id", protectRoute, markMessageAsSeen);

// Mark all messages in a chat as seen
// Add this route to your messageRoutes.js
messageRouter.put("/mark-chat/:chatId", protectRoute, async (req, res) => {
  try {
    const { chatId } = req.params;
    const userId = req.user._id;

    console.log(`📨 Marking chat as seen - Chat: ${chatId}, User: ${userId}`);

    // Check if it's a group or user chat
    const isGroup = await Group.findById(chatId);
    
    let result;

    if (isGroup) {
      // For group messages
      result = await Message.updateMany(
        {
          receiverId: chatId,
          receiverType: 'Group',
          "seenBy.userId": { $ne: userId },
          isDeleted: false
        },
        { 
          $push: { 
            seenBy: { 
              userId: userId, 
              seenAt: new Date() 
            } 
          } 
        }
      );
    } else {
      // For private messages
      result = await Message.updateMany(
        { 
          senderId: chatId, 
          receiverId: userId, 
          receiverType: 'User', 
          seen: false,
          isDeleted: false
        },
        { 
          $set: { 
            seen: true,
            seenAt: new Date()
          } 
        }
      );
    }

    res.json({ 
      success: true, 
      message: "Chat marked as seen",
      updatedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Mark chat as seen error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to mark chat as seen"
    });
  }
});
// Send text message
messageRouter.post("/send/:id", protectRoute, sendMessage);

// Send media or emoji message
messageRouter.post("/send-media/:id", protectRoute, sendMediaMessage);

// Message reactions
messageRouter.post("/:id/reaction", protectRoute, addReaction);
messageRouter.delete("/:id/reaction", protectRoute, removeReaction);
messageRouter.get("/:id/reactions", protectRoute, getMessageReactions);

// Edit message
messageRouter.put("/:id/edit", protectRoute, editMessage);

// Delete a message by ID
messageRouter.delete("/delete/:id", protectRoute, deleteMessageById);

// Clear chat with a user or group
messageRouter.delete("/clear/:id", protectRoute, clearChatWithUser);

// Forward message
messageRouter.post("/forward", protectRoute, forwardMessage);

export default messageRouter;