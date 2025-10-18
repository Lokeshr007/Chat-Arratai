import Group from "../models/Group.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new group
export const createGroup = async (req, res) => {
  try {
    const { name, members, image, description } = req.body;
    const admin = req.user._id;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Group name is required" });
    }

    let imageUrl = null;
    if (image && !image.startsWith('http')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_app/groups",
          quality: "auto",
          fetch_format: "auto"
        });
        imageUrl = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ success: false, message: "Failed to upload group image" });
      }
    } else if (image) {
      imageUrl = image;
    }

    // Validate members exist
    const validMembers = [];
    if (members && members.length > 0) {
      for (const memberId of members) {
        const user = await User.findById(memberId);
        if (user) {
          validMembers.push(memberId);
        }
      }
    }

    const group = await Group.create({
      name: name.trim(),
      admin,
      image: imageUrl,
      description: description || "",
      members: [...new Set([admin.toString(), ...validMembers])],
    });

    // Populate for response
    await group.populate('members', 'fullName profilePic username email');
    await group.populate('admin', 'fullName profilePic username');

    // Notify all members about new group
    group.members.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("groupCreated", group);
      }
    });

    res.status(201).json({ 
      success: true, 
      group,
      message: "Group created successfully"
    });
  } catch (error) {
    console.error("Create group error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get groups where user is a member with enhanced data
export const getMyGroups = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const groups = await Group.find({ members: userId })
      .populate("members", "fullName email profilePic username lastSeen")
      .populate('admin', 'fullName profilePic username')
      .sort({ updatedAt: -1 });

    const groupsWithLastMessage = await Promise.all(
      groups.map(async (group) => {
        const lastMessage = await Message.findOne({
          receiverId: group._id,
          receiverType: 'Group',
          isDeleted: false
        })
        .sort({ createdAt: -1 })
        .select('text media fileType createdAt senderId')
        .populate('senderId', 'fullName profilePic');

        const unseenCount = await Message.countDocuments({
          receiverId: group._id,
          receiverType: 'Group',
          'seenBy.userId': { $ne: userId },
          isDeleted: false
        });

        return {
          ...group.toObject(),
          lastMessage: lastMessage || null,
          unseenCount
        };
      })
    );

    // Sort by last message time
    groupsWithLastMessage.sort((a, b) => {
      if (a.lastMessage && b.lastMessage) {
        return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
      }
      if (a.lastMessage && !b.lastMessage) return -1;
      if (!a.lastMessage && b.lastMessage) return 1;
      return new Date(b.updatedAt) - new Date(a.updatedAt);
    });

    res.json({ 
      success: true, 
      groups: groupsWithLastMessage
    });
  } catch (error) {
    console.error("Get groups error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get group details with enhanced member information
export const getGroupDetails = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate('members', 'fullName profilePic username email bio lastSeen')
      .populate('admin', 'fullName profilePic username');

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.some(member => member._id.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    // Get group media
    const groupMedia = await Message.find({
      receiverId: groupId,
      receiverType: 'Group',
      media: { $exists: true, $ne: [] },
      isDeleted: false
    })
    .select('media fileType createdAt senderId')
    .populate('senderId', 'fullName profilePic')
    .sort({ createdAt: -1 })
    .limit(50);

    const allMedia = groupMedia.flatMap(msg => 
      msg.media.map(url => ({
        url,
        type: msg.fileType || 'other',
        uploadedBy: msg.senderId,
        uploadedAt: msg.createdAt
      }))
    );

    // Get group statistics
    const totalMessages = await Message.countDocuments({
      receiverId: groupId,
      receiverType: 'Group',
      isDeleted: false
    });

    const mediaCount = await Message.countDocuments({
      receiverId: groupId,
      receiverType: 'Group',
      media: { $exists: true, $ne: [] },
      isDeleted: false
    });

    res.json({ 
      success: true, 
      group: {
        ...group.toObject(),
        media: allMedia,
        mediaCount: allMedia.length,
        totalMessages,
        statistics: {
          totalMessages,
          mediaCount,
          membersCount: group.members.length
        }
      }
    });
  } catch (error) {
    console.error("Get group details error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all messages in a group with pagination - ADD THIS FUNCTION
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const userId = req.user._id;

    const skip = (page - 1) * limit;

    // Validate group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.includes(userId)) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    const messages = await Message.find({ 
      receiverId: groupId, 
      receiverType: 'Group',
      isDeleted: false
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("senderId", "fullName profilePic username")
    .populate('replyTo', 'text media fileType senderId')
    .populate('forwardedFrom', 'text media fileType senderId');

    const totalMessages = await Message.countDocuments({
      receiverId: groupId, 
      receiverType: 'Group',
      isDeleted: false
    });

    // Mark messages as seen by current user
    await Message.updateMany(
      { 
        receiverId: groupId, 
        receiverType: 'Group',
        'seenBy.userId': { $ne: userId }
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

    // Reverse to get chronological order
    messages.reverse();

    res.json({ 
      success: true, 
      messages,
      group: {
        _id: group._id,
        name: group.name,
        image: group.image,
        description: group.description,
        admin: group.admin,
        membersCount: group.members.length,
        isAdmin: group.admin.toString() === userId.toString()
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalMessages / limit),
        totalMessages,
        hasNext: (page * limit) < totalMessages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get group messages error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send message in a group
export const sendGroupMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { text, mediaUrls, fileType = 'other', replyTo, emojis } = req.body;
    const senderId = req.user._id;

    // Validate group exists and user is member
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.includes(senderId)) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    if (!text?.trim() && (!mediaUrls || mediaUrls.length === 0) && !emojis?.length) {
      return res.status(400).json({ success: false, message: "Message content is required" });
    }

    // Validate replyTo message exists and belongs to same group
    if (replyTo) {
      const replyMessage = await Message.findById(replyTo);
      if (!replyMessage || replyMessage.receiverId.toString() !== groupId.toString()) {
        return res.status(400).json({ success: false, message: "Invalid reply message" });
      }
    }

    // Process media URLs if provided
    let processedMediaUrls = [];
    if (mediaUrls && mediaUrls.length > 0) {
      for (const media of mediaUrls) {
        if (typeof media === 'string' && media.startsWith('data:')) {
          // Upload base64 to Cloudinary
          try {
            const resourceType = fileType === 'video' ? 'video' : 'auto';
            const uploadResult = await cloudinary.uploader.upload(media, {
              resource_type: resourceType,
              folder: `chat_app/groups/${groupId}/media`,
              quality: "auto",
              fetch_format: "auto"
            });
            processedMediaUrls.push(uploadResult.secure_url);
          } catch (uploadError) {
            console.error("Media upload error:", uploadError);
            return res.status(400).json({ success: false, message: "Failed to upload media" });
          }
        } else if (typeof media === 'string') {
          processedMediaUrls.push(media);
        }
      }
    }

    const messageData = {
      senderId,
      receiverId: groupId,
      receiverType: 'Group',
      text: text?.trim() || "",
      media: processedMediaUrls,
      fileType,
      emojis: emojis || [],
      seenBy: [{ userId: senderId, seenAt: new Date() }] // Mark as seen by sender
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

    // Emit to group room
    io.to(`group_${groupId}`).emit("newGroupMessage", newMessage);

    // Update group's updatedAt timestamp
    await Group.findByIdAndUpdate(groupId, { updatedAt: new Date() });

    res.json({ 
      success: true, 
      newMessage,
      message: "Message sent successfully"
    });
  } catch (error) {
    console.error("Send group message error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enhanced Add member to group with better validation
export const addMemberToGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { memberIds } = req.body;

    if (!memberIds || !Array.isArray(memberIds) || memberIds.length === 0) {
      return res.status(400).json({ success: false, message: "Member IDs are required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only group admin can add members" });
    }

    // Validate users exist and get valid members
    const validMembers = [];
    const existingMembers = [];
    const invalidMembers = [];
    
    for (const memberId of memberIds) {
      const userToAdd = await User.findById(memberId);
      if (!userToAdd) {
        invalidMembers.push(memberId);
        continue;
      }

      if (group.members.includes(memberId)) {
        existingMembers.push({
          _id: userToAdd._id,
          fullName: userToAdd.fullName
        });
      } else {
        validMembers.push({
          _id: userToAdd._id,
          fullName: userToAdd.fullName,
          profilePic: userToAdd.profilePic,
          username: userToAdd.username
        });
      }
    }

    if (validMembers.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No valid users to add",
        details: {
          existingMembers: existingMembers.map(m => m.fullName),
          invalidMembers
        }
      });
    }

    // Add members
    const memberIdsToAdd = validMembers.map(m => m._id);
    group.members.push(...memberIdsToAdd);
    await group.save();

    // Populate for response
    await group.populate('members', 'fullName profilePic username email');
    await group.populate('admin', 'fullName profilePic username');

    // Notify new members and existing members
    group.members.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("groupMembersUpdated", {
          groupId: group._id,
          action: 'added',
          members: validMembers,
          updatedBy: req.user._id,
          updatedByUser: {
            _id: req.user._id,
            fullName: req.user.fullName
          }
        });
      }
    });

    // Notify added users
    validMembers.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("addedToGroup", {
          groupId: group._id,
          groupName: group.name,
          addedBy: req.user._id,
          addedByName: req.user.fullName
        });
      }
    });

    res.json({ 
      success: true, 
      message: `${validMembers.length} member(s) added successfully`,
      group,
      addedMembers: validMembers,
      existingMembers,
      invalidMembers
    });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enhanced Remove member from group
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { groupId, memberId } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if user is admin or the member trying to leave
    const isAdmin = group.admin.toString() === currentUserId.toString();
    const isSelfRemoval = memberId === currentUserId.toString();
    
    if (!isAdmin && !isSelfRemoval) {
      return res.status(403).json({ success: false, message: "Not authorized to remove this member" });
    }

    // Prevent admin from removing themselves
    if (memberId === group.admin.toString() && isSelfRemoval) {
      return res.status(400).json({ 
        success: false, 
        message: "Group admin cannot remove themselves. Transfer admin rights first." 
      });
    }

    // Check if member exists in group
    if (!group.members.includes(memberId)) {
      return res.status(400).json({ success: false, message: "User is not a member of this group" });
    }

    const removedUser = await User.findById(memberId).select('fullName profilePic username');

    // Remove member
    group.members = group.members.filter(id => id.toString() !== memberId);
    await group.save();

    // Populate for response
    await group.populate('members', 'fullName profilePic username email');
    await group.populate('admin', 'fullName profilePic username');

    // Notify all group members
    group.members.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("groupMembersUpdated", {
          groupId: group._id,
          action: 'removed',
          members: [removedUser],
          updatedBy: currentUserId,
          updatedByUser: {
            _id: currentUserId,
            fullName: req.user.fullName
          },
          isSelfRemoval
        });
      }
    });

    // Notify removed user
    const removedUserSocketId = userSocketMap[memberId];
    if (removedUserSocketId) {
      io.to(removedUserSocketId).emit("removedFromGroup", {
        groupId: group._id,
        groupName: group.name,
        removedBy: currentUserId,
        removedByName: req.user.fullName,
        isSelfRemoval
      });
    }

    res.json({ 
      success: true, 
      message: isSelfRemoval ? "You have left the group" : "Member removed successfully", 
      group,
      removedMember: removedUser
    });
  } catch (error) {
    console.error("Remove member error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave group
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if user is a member
    if (!group.members.includes(userId)) {
      return res.status(400).json({ success: false, message: "You are not a member of this group" });
    }

    // Prevent admin from leaving (they should transfer admin or delete group)
    if (group.admin.toString() === userId.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: "Group admin cannot leave. Transfer admin rights or delete the group." 
      });
    }

    // Remove user from members
    group.members = group.members.filter(id => id.toString() !== userId.toString());
    await group.save();

    // Populate for response
    await group.populate('members', 'fullName profilePic username email');
    await group.populate('admin', 'fullName profilePic username');

    // Notify group members
    group.members.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("userLeftGroup", {
          groupId: group._id,
          userId: userId,
          userName: req.user.fullName,
          leftAt: new Date()
        });
      }
    });

    // Notify user who left
    const userSocketId = userSocketMap[userId];
    if (userSocketId) {
      io.to(userSocketId).emit("leftGroup", {
        groupId: group._id,
        groupName: group.name
      });
    }

    res.json({ 
      success: true, 
      message: "You have left the group successfully",
      group
    });
  } catch (error) {
    console.error("Leave group error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update group info
export const updateGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, image } = req.body;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: "Only group admin can update group info" });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description;

    if (image && !image.startsWith('http')) {
      try {
        const uploadResponse = await cloudinary.uploader.upload(image, {
          folder: "chat_app/groups",
          quality: "auto",
          fetch_format: "auto"
        });
        updateData.image = uploadResponse.secure_url;
      } catch (uploadError) {
        console.error("Image upload error:", uploadError);
        return res.status(400).json({ success: false, message: "Failed to upload group image" });
      }
    } else if (image) {
      updateData.image = image;
    }

    const updatedGroup = await Group.findByIdAndUpdate(
      groupId,
      updateData,
      { new: true }
    )
    .populate('members', 'fullName profilePic username email')
    .populate('admin', 'fullName profilePic username');

    // Notify all group members
    updatedGroup.members.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("groupUpdated", {
          group: updatedGroup,
          updatedBy: currentUserId,
          updatedByName: req.user.fullName
        });
      }
    });

    res.json({ 
      success: true, 
      message: "Group updated successfully", 
      group: updatedGroup 
    });
  } catch (error) {
    console.error("Update group info error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Transfer group admin
export const transferGroupAdmin = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { newAdminId } = req.body;
    const currentUserId = req.user._id;

    if (!newAdminId) {
      return res.status(400).json({ success: false, message: "New admin ID is required" });
    }

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if current user is admin
    if (group.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: "Only current admin can transfer admin rights" });
    }

    // Check if new admin is a member
    if (!group.members.includes(newAdminId)) {
      return res.status(400).json({ success: false, message: "New admin must be a group member" });
    }

    // Check if new admin is same as current admin
    if (newAdminId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: "You are already the admin" });
    }

    const newAdmin = await User.findById(newAdminId).select('fullName profilePic username');

    // Transfer admin
    group.admin = newAdminId;
    await group.save();

    // Populate for response
    await group.populate('members', 'fullName profilePic username email');
    await group.populate('admin', 'fullName profilePic username');

    // Notify all group members
    group.members.forEach(member => {
      const socketId = userSocketMap[member._id.toString()];
      if (socketId) {
        io.to(socketId).emit("groupAdminTransferred", {
          groupId: group._id,
          newAdmin: group.admin,
          previousAdmin: {
            _id: currentUserId,
            fullName: req.user.fullName
          },
          transferredBy: currentUserId
        });
      }
    });

    res.json({ 
      success: true, 
      message: `Admin rights transferred to ${newAdmin.fullName}`, 
      group 
    });
  } catch (error) {
    console.error("Transfer group admin error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Enhanced Delete a group with comprehensive cleanup
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const currentUserId = req.user._id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    // Check if user is admin
    if (group.admin.toString() !== currentUserId.toString()) {
      return res.status(403).json({ success: false, message: "Only group admin can delete the group" });
    }

    // Get all members for notification
    const members = group.members;

    // Soft delete all group messages
    const deleteResult = await Message.updateMany(
      { 
        receiverId: groupId, 
        receiverType: 'Group' 
      },
      { 
        $set: { 
          isDeleted: true,
          deletedAt: new Date(),
          deletedBy: currentUserId
        } 
      }
    );

    // Notify all members before deletion
    members.forEach(memberId => {
      const socketId = userSocketMap[memberId.toString()];
      if (socketId) {
        io.to(socketId).emit("groupDeleted", {
          groupId: group._id,
          groupName: group.name,
          deletedBy: currentUserId,
          deletedByName: req.user.fullName,
          deletedAt: new Date(),
          message: `Group "${group.name}" has been deleted by ${req.user.fullName}`
        });
      }
    });

    // Delete the group
    await Group.findByIdAndDelete(groupId);

    res.json({ 
      success: true, 
      message: "Group deleted successfully",
      deletedMessages: deleteResult.modifiedCount,
      deletedGroup: {
        _id: group._id,
        name: group.name,
        membersCount: members.length
      }
    });
  } catch (error) {
    console.error("Delete group error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get group members with enhanced information
export const getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId)
      .populate('members', 'fullName profilePic username email lastSeen bio')
      .populate('admin', 'fullName profilePic username');

    if (!group) {
      return res.status(404).json({ success: false, message: "Group not found" });
    }

    if (!group.members.some(member => member._id.toString() === userId.toString())) {
      return res.status(403).json({ success: false, message: "You are not a member of this group" });
    }

    // Enhance members with role information
    const enhancedMembers = group.members.map(member => ({
      ...member.toObject(),
      isAdmin: member._id.toString() === group.admin._id.toString(),
      role: member._id.toString() === group.admin._id.toString() ? 'admin' : 'member',
      canRemove: member._id.toString() !== group.admin._id.toString() && 
                 group.admin.toString() === userId.toString()
    }));

    res.json({ 
      success: true, 
      members: enhancedMembers,
      totalMembers: enhancedMembers.length,
      admin: group.admin,
      currentUserRole: group.admin.toString() === userId.toString() ? 'admin' : 'member'
    });
  } catch (error) {
    console.error("Get group members error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Search groups
export const searchGroups = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({ success: false, message: "Search query must be at least 2 characters" });
    }

    const groups = await Group.find({
      members: userId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .populate('members', 'fullName profilePic username')
    .populate('admin', 'fullName profilePic username')
    .limit(20);

    res.json({ 
      success: true, 
      groups,
      count: groups.length
    });
  } catch (error) {
    console.error("Search groups error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};