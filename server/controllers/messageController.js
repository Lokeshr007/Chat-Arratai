import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Group.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../lib/cloudinary.js";

// Get all users except the logged-in user for sidebar
// Enhanced getUsersForSidebar with privacy
// Enhanced getUsersForSidebar with friend requests in mind
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    const currentUser = await User.findById(userId);

    // Get all active users except current user and blocked users
    const users = await User.find({ 
      _id: { $ne: userId },
      _id: { $nin: currentUser.blockedUsers },
      blockedUsers: { $ne: userId },
      status: 'active'
    }).select("-password -verificationToken");

    const usersWithDetails = await Promise.all(
      users.map(async (user) => {
        // Check if users are friends
        const isFriend = currentUser.friends.some(
          friend => friend.user.toString() === user._id.toString()
        );

        // Check if there's a pending friend request
        const hasSentRequest = currentUser.sentFriendRequests.some(
          req => req.to.toString() === user._id.toString() && req.status === 'pending'
        );

        const hasReceivedRequest = currentUser.friendRequests.some(
          req => req.from.toString() === user._id.toString() && req.status === 'pending'
        );

        // Get last message between users
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: user._id, receiverType: 'User' },
            { senderId: user._id, receiverId: userId, receiverType: 'User' }
          ]
        })
        .sort({ createdAt: -1 })
        .select('text media fileType createdAt seen isDeleted')
        .populate('senderId', 'fullName');

        const unseenCount = await Message.countDocuments({
          senderId: user._id,
          receiverId: userId,
          receiverType: 'User',
          seen: false,
          isDeleted: false
        });

        // Determine friendship status for UI
        let friendshipStatus = 'not_friends';
        if (isFriend) {
          friendshipStatus = 'friends';
        } else if (hasSentRequest) {
          friendshipStatus = 'request_sent';
        } else if (hasReceivedRequest) {
          friendshipStatus = 'request_received';
        }

        return {
          _id: user._id,
          fullName: user.fullName,
          username: user.username,
          profilePic: user.profilePic,
          lastSeen: user.lastSeen,
          isFriend,
          friendshipStatus,
          hasSentRequest,
          hasReceivedRequest,
          lastMessage: lastMessage && !lastMessage.isDeleted ? lastMessage : null,
          unseenCount,
          // Include privacy settings for frontend
          privacySettings: user.privacySettings
        };
      })
    );

    // Sort by: friends first, then by last message time, then alphabetically
    const sortedUsers = usersWithDetails.sort((a, b) => {
      // Friends first
      if (a.isFriend && !b.isFriend) return -1;
      if (!a.isFriend && b.isFriend) return 1;
      
      // Then by last message time
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      
      // Then alphabetically
      return a.fullName.localeCompare(b.fullName);
    });

    res.json({ 
      success: true, 
      users: sortedUsers,
      currentUser: {
        friends: currentUser.friends,
        friendRequests: currentUser.friendRequests,
        sentFriendRequests: currentUser.sentFriendRequests
      }
    });
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// Get messages between logged-in user and selected user/group
// Get messages between logged-in user and selected user/group - ENHANCED
export const getMessages = async (req, res) => {
    try {
        const { id: chatId } = req.params;
        const { page = 1, limit = 50, forceRefresh = false } = req.query;
        const myId = req.user._id;

        const skip = (page - 1) * limit;

        console.log(`📨 Fetching messages for chat: ${chatId}, page: ${page}`);

        // Check if it's a group or user chat
        const isGroup = await Group.findById(chatId);
        
        let messages;
        let totalMessages;
        
        if (isGroup) {
            // Group messages - exclude deleted messages
            messages = await Message.find({
                receiverId: chatId,
                receiverType: 'Group',
                isDeleted: false
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('senderId', 'fullName profilePic username')
            .populate('replyTo', 'text media fileType senderId')
            .populate('forwardedFrom', 'text media fileType senderId');

            totalMessages = await Message.countDocuments({
                receiverId: chatId,
                receiverType: 'Group',
                isDeleted: false
            });

            // Mark messages as seen by current user in group
            await Message.updateMany(
                { 
                    receiverId: chatId, 
                    receiverType: 'Group',
                    "seenBy.userId": { $ne: myId },
                    isDeleted: false
                },
                { 
                    $push: { 
                        seenBy: { 
                            userId: myId, 
                            seenAt: new Date() 
                        } 
                    } 
                }
            );

        } else {
            // Private messages - exclude deleted messages
            const query = {
                $or: [
                    { senderId: myId, receiverId: chatId, receiverType: 'User', isDeleted: false },
                    { senderId: chatId, receiverId: myId, receiverType: 'User', isDeleted: false }
                ]
            };

            messages = await Message.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('senderId', 'fullName profilePic username')
            .populate('replyTo', 'text media fileType senderId')
            .populate('forwardedFrom', 'text media fileType senderId');

            totalMessages = await Message.countDocuments(query);

            // Mark private messages as seen
            await Message.updateMany(
                { 
                    senderId: chatId, 
                    receiverId: myId, 
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

            // Notify sender that messages were seen
            const senderSocketId = userSocketMap[chatId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messageSeen", { 
                    senderId: myId,
                    receiverId: chatId,
                    seenAt: new Date()
                });
            }
        }

        // Reverse to get chronological order
        const chronologicalMessages = messages.reverse();

        console.log(`✅ Loaded ${chronologicalMessages.length} messages for chat ${chatId}`);

        res.json({ 
            success: true, 
            messages: chronologicalMessages,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalMessages / limit),
                totalMessages,
                hasNext: (page * limit) < totalMessages,
                hasPrev: page > 1
            },
            chatInfo: {
                isGroup: !!isGroup,
                totalMessages
            }
        });
    } catch (error) {
        console.error("❌ Get messages error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to load messages",
            error: error.message 
        });
    }
};

// Mark single message as seen
export const markMessageAsSeen = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;
        
        const message = await Message.findById(messageId)
            .populate('senderId', 'fullName profilePic');
            
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // For private messages
        if (message.receiverType === 'User') {
            if (message.receiverId.toString() !== userId.toString()) {
                return res.status(403).json({ success: false, message: "Not authorized" });
            }
            message.seen = true;
        } else {
            // For group messages - add to seenBy array
            const alreadySeen = message.seenBy.some(seen => 
                seen.userId.toString() === userId.toString()
            );
            if (!alreadySeen) {
                message.seenBy.push({ userId, seenAt: new Date() });
            }
        }

        await message.save();

        // Notify sender
        const senderSocketId = userSocketMap[message.senderId._id.toString()];
        if (senderSocketId) {
            io.to(senderSocketId).emit("messageSeen", {
                messageId: message._id,
                seenBy: userId,
                seenAt: new Date()
            });
        }

        res.json({ success: true, message });
    } catch (error) {
        console.error("Mark message as seen error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send text message
export const sendMessage = async (req, res) => {
    try {
        const { text, replyTo, emojis } = req.body;
        const receiverId = req.params.id;
        const senderId = req.user._id;

        if (!text?.trim() && !emojis?.length) {
            return res.status(400).json({ success: false, message: "Message content is required" });
        }

        // Check if receiver exists and is not blocked
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ success: false, message: "Receiver not found" });
        }

        // Check if current user is blocked by receiver
        if (receiver.blockedUsers.includes(senderId)) {
            return res.status(403).json({ success: false, message: "Cannot send message to this user" });
        }

        // Validate replyTo message exists and belongs to same chat
        if (replyTo) {
            const replyMessage = await Message.findById(replyTo);
            if (!replyMessage) {
                return res.status(404).json({ success: false, message: "Reply message not found" });
            }
            if (replyMessage.receiverId.toString() !== receiverId.toString() && 
                replyMessage.senderId.toString() !== senderId.toString()) {
                return res.status(400).json({ success: false, message: "Invalid reply message" });
            }
        }

        const messageData = { 
            senderId, 
            receiverId, 
            receiverType: 'User',
            text: text?.trim(), 
            emojis: emojis || [],
            seen: false 
        };

        if (replyTo) {
            messageData.replyTo = replyTo;
        }

        const newMessage = await Message.create(messageData);

        // Populate sender info for socket emission
        await newMessage.populate('senderId', 'fullName profilePic username');
        if (replyTo) {
            await newMessage.populate('replyTo', 'text media fileType senderId');
        }

        // Send to receiver via socket
        const receiverSocketId = userSocketMap[receiverId];
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.json({ success: true, newMessage });
    } catch (error) {
        console.error("Send message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send media message
// Enhanced sendMediaMessage function
export const sendMediaMessage = async (req, res) => {
  try {
    const { text, mediaUrls, fileType = 'other', replyTo } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    console.log("📨 Sending media message:", { receiverId, fileType, mediaUrlsCount: mediaUrls?.length });

    if (!mediaUrls || mediaUrls.length === 0) {
      return res.status(400).json({ success: false, message: "Media files are required" });
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ success: false, message: "Receiver not found" });
    }

    // Check if current user is blocked by receiver
    if (receiver.blockedUsers.includes(senderId)) {
      return res.status(403).json({ success: false, message: "Cannot send message to this user" });
    }

    // Validate replyTo message
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage) {
        return res.status(404).json({ success: false, message: "Reply message not found" });
      }
    }

    const messageData = {
      senderId,
      receiverId,
      receiverType: 'User',
      text: text?.trim() || "",
      media: mediaUrls, // Use the URLs directly (they should already be Cloudinary URLs)
      fileType,
      seen: false
    };

    if (replyTo) {
      messageData.replyTo = replyTo;
    }

    const newMessage = await Message.create(messageData);

    // Populate sender info
    await newMessage.populate('senderId', 'fullName profilePic username');
    if (replyTo) {
      await newMessage.populate('replyTo', 'text media fileType senderId');
    }

    console.log("✅ Media message created:", newMessage._id);

    // Send to receiver via socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.error("❌ Send media message error:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to send media message",
      error: error.message 
    });
  }
};

// Add reaction to message
export const addReaction = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        if (!emoji) {
            return res.status(400).json({ success: false, message: "Emoji is required" });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Remove existing reaction from this user
        message.reactions = message.reactions.filter(
            reaction => reaction.userId.toString() !== userId.toString()
        );

        // Add new reaction
        message.reactions.push({
            userId,
            emoji,
            reactedAt: new Date()
        });

        await message.save();

        // Populate for socket emission
        await message.populate('reactions.userId', 'fullName profilePic');

        // Notify all participants in the chat
        let participants = [];
        if (message.receiverType === 'User') {
            participants = [message.senderId, message.receiverId];
        } else {
            const group = await Group.findById(message.receiverId);
            participants = group.members;
        }

        participants.forEach(participantId => {
            const socketId = userSocketMap[participantId.toString()];
            if (socketId) {
                io.to(socketId).emit("messageReaction", {
                    messageId: message._id,
                    reaction: message.reactions.find(r => r.userId._id.toString() === userId.toString())
                });
            }
        });

        res.json({ success: true, message });
    } catch (error) {
        console.error("Add reaction error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Remove reaction from message
export const removeReaction = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Remove user's reaction
        const initialLength = message.reactions.length;
        message.reactions = message.reactions.filter(
            reaction => reaction.userId.toString() !== userId.toString()
        );

        if (message.reactions.length === initialLength) {
            return res.status(404).json({ success: false, message: "Reaction not found" });
        }

        await message.save();

        // Notify all participants
        let participants = [];
        if (message.receiverType === 'User') {
            participants = [message.senderId, message.receiverId];
        } else {
            const group = await Group.findById(message.receiverId);
            participants = group.members;
        }

        participants.forEach(participantId => {
            const socketId = userSocketMap[participantId.toString()];
            if (socketId) {
                io.to(socketId).emit("reactionRemoved", {
                    messageId: message._id,
                    userId: userId
                });
            }
        });

        res.json({ success: true, message });
    } catch (error) {
        console.error("Remove reaction error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Edit message
export const editMessage = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const { text } = req.body;
        const userId = req.user._id;

        if (!text?.trim()) {
            return res.status(400).json({ success: false, message: "Message text is required" });
        }

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Only allow sender to edit their own messages
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to edit this message" });
        }

        // Can't edit media messages or forwarded messages
        if (message.media.length > 0 || message.forwardedFrom) {
            return res.status(400).json({ success: false, message: "Cannot edit this type of message" });
        }

        message.text = text.trim();
        message.isEdited = true;
        message.editedAt = new Date();
        await message.save();

        // Populate for socket emission
        await message.populate('senderId', 'fullName profilePic username');

        // Notify all participants
        let participants = [];
        if (message.receiverType === 'User') {
            participants = [message.senderId, message.receiverId];
        } else {
            const group = await Group.findById(message.receiverId);
            participants = group.members;
        }

        participants.forEach(participantId => {
            const socketId = userSocketMap[participantId.toString()];
            if (socketId) {
                io.to(socketId).emit("messageEdited", message);
            }
        });

        res.json({ success: true, message });
    } catch (error) {
        console.error("Edit message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete single message (soft delete)
export const deleteMessageById = async (req, res) => {
    try {
        const { id: messageId } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        // Only allow sender to delete their own messages
        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this message" });
        }

        // Soft delete
        message.isDeleted = true;
        await message.save();

        // Notify all participants
        let participants = [];
        if (message.receiverType === 'User') {
            participants = [message.senderId, message.receiverId];
        } else {
            const group = await Group.findById(message.receiverId);
            participants = group.members;
        }

        participants.forEach(participantId => {
            const socketId = userSocketMap[participantId.toString()];
            if (socketId) {
                io.to(socketId).emit("messageDeleted", {
                    messageId: message._id,
                    deletedBy: userId
                });
            }
        });

        res.json({ success: true, message: "Message deleted successfully" });
    } catch (error) {
        console.error("Delete message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Clear chat with user - PERMANENT DELETE
// Clear chat with user - PERMANENT DELETE
// Make sure this function is exported
export const clearChatWithUser = async (req, res) => {
    try {
        const chatId = req.params.id;
        const currentUserId = req.user._id;

        console.log(`🗑️ CLEAR CHAT BACKEND - User: ${currentUserId}, Chat: ${chatId}`);

        // Check if it's a group or user chat
        const isGroup = await Group.findById(chatId);
        
        let result;

        if (isGroup) {
            // Group chat - delete all messages in the group
            result = await Message.deleteMany({
                receiverId: chatId,
                receiverType: 'Group'
            });
            console.log(`✅ DELETED ${result.deletedCount} GROUP MESSAGES`);
        } else {
            // Private chat - delete all messages between users
            result = await Message.deleteMany({
                $or: [
                    { senderId: currentUserId, receiverId: chatId, receiverType: 'User' },
                    { senderId: chatId, receiverId: currentUserId, receiverType: 'User' }
                ]
            });
            console.log(`✅ DELETED ${result.deletedCount} PRIVATE MESSAGES`);
        }

        res.json({ 
            success: true, 
            message: "Chat cleared permanently",
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("❌ Clear chat error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to clear chat",
            error: error.message 
        });
    }
};
// Forward message
export const forwardMessage = async (req, res) => {
    try {
        const { originalMessageId, receiverIds, receiverType = 'User' } = req.body;
        const senderId = req.user._id;

        if (!originalMessageId || !receiverIds || receiverIds.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: "Original message ID and receiver IDs are required" 
            });
        }

        // Get original message
        const originalMessage = await Message.findById(originalMessageId)
            .populate('senderId', 'fullName');
            
        if (!originalMessage || originalMessage.isDeleted) {
            return res.status(404).json({ 
                success: false, 
                message: "Original message not found" 
            });
        }

        const forwardedMessages = [];

        for (const receiverId of receiverIds) {
            // Check if receiver exists
            let receiver;
            if (receiverType === 'User') {
                receiver = await User.findById(receiverId);
            } else {
                receiver = await Group.findById(receiverId);
            }

            if (!receiver) {
                continue; // Skip invalid receivers
            }

            // Create forwarded message
            const forwardedMessage = await Message.create({
                senderId,
                receiverId,
                receiverType,
                text: originalMessage.text,
                media: originalMessage.media || [],
                fileType: originalMessage.fileType || 'other',
                forwardedFrom: originalMessageId,
                seen: false
            });

            // Populate sender info
            await forwardedMessage.populate('senderId', 'fullName profilePic username');
            await forwardedMessage.populate('forwardedFrom', 'text media fileType senderId');

            forwardedMessages.push(forwardedMessage);

            // Send to receiver via socket
            if (receiverType === 'User') {
                const receiverSocketId = userSocketMap[receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("newMessage", forwardedMessage);
                }
            } else {
                // For groups, notify all members
                const group = await Group.findById(receiverId).populate('members');
                group.members.forEach(member => {
                    const socketId = userSocketMap[member._id.toString()];
                    if (socketId) {
                        io.to(socketId).emit("newMessage", forwardedMessage);
                    }
                });
            }
        }

        res.json({ 
            success: true, 
            message: "Message forwarded successfully",
            forwardedMessages 
        });
    } catch (error) {
        console.error("Forward message error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get message reactions
export const getMessageReactions = async (req, res) => {
    try {
        const { id: messageId } = req.params;

        const message = await Message.findById(messageId)
            .populate('reactions.userId', 'fullName profilePic username');

        if (!message) {
            return res.status(404).json({ success: false, message: "Message not found" });
        }

        res.json({ 
            success: true, 
            reactions: message.reactions 
        });
    } catch (error) {
        console.error("Get message reactions error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// Mark all messages in a chat as seen
export const markChatAsSeen = async (req, res) => {
    try {
        const { chatId } = req.params;
        const userId = req.user._id;

        console.log(`📨 Marking chat as seen - Chat: ${chatId}, User: ${userId}`);

        // Check if it's a group or user chat
        const isGroup = await Group.findById(chatId);
        
        let result;

        if (isGroup) {
            // For group messages - add user to seenBy array for all unseen messages
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

            console.log(`✅ Group messages marked as seen: ${result.modifiedCount} messages`);

            // Notify group members
            const group = await Group.findById(chatId).populate('members');
            group.members.forEach(member => {
                if (member._id.toString() !== userId.toString()) {
                    const socketId = userSocketMap[member._id.toString()];
                    if (socketId) {
                        io.to(socketId).emit("groupMessagesSeen", {
                            groupId: chatId,
                            seenBy: userId,
                            timestamp: new Date(),
                            messageCount: result.modifiedCount
                        });
                    }
                }
            });

        } else {
            // For private messages - mark all messages from this chat as seen
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

            console.log(`✅ Private messages marked as seen: ${result.modifiedCount} messages`);

            // Notify sender that messages were seen
            const senderSocketId = userSocketMap[chatId];
            if (senderSocketId) {
                io.to(senderSocketId).emit("messagesSeen", { 
                    chatId: userId, // The receiver's ID (current user)
                    seenBy: userId,
                    seenAt: new Date(),
                    messageCount: result.modifiedCount
                });
            }
        }

        res.json({ 
            success: true, 
            message: "Chat marked as seen",
            updatedCount: result.modifiedCount,
            chatType: isGroup ? 'group' : 'private'
        });
    } catch (error) {
        console.error("❌ Mark chat as seen error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Failed to mark chat as seen",
            error: error.message 
        });
    }
};