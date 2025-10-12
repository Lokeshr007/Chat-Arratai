// controllers/AuthController.js - Complete with all exports
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Signup with email verification
export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    // Validation
    if (!fullName || !username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists"
      });
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address"
      });
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long"
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      verificationToken
    });

    // Send verification email
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify Your Email - ChatApp',
        html: `
          <h2>Welcome to ChatApp!</h2>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationUrl}" style="background:#7c3aed;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Verify Email
          </a>
          <p>This link will expire in 24 hours.</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Continue even if email fails
    }

    res.status(201).json({
  success: true,
  message: "User created successfully. Please check your email for verification.",
  userData: {  // CHANGE 'user' to 'userData'
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email
  }
});

  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({
        success: false,
        message: "Please verify your email before logging in"
      });
    }

    // Check if account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: "Your account has been suspended"
      });
    }

    // Update last seen
    user.lastSeen = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

   res.json({
  success: true,
  message: "Login successful",
  token,
  userData: {  // CHANGE 'user' to 'userData'
    _id: user._id,
    fullName: user.fullName,
    username: user.username,
    email: user.email,
    profilePic: user.profilePic
  }
});

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists or not
      return res.json({
        success: true,
        message: "If the email exists, a reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Reset Your Password - ChatApp',
        html: `
          <h2>Password Reset Request</h2>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="background:#7c3aed;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    res.json({
      success: true,
      message: "If the email exists, a reset link has been sent"
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password are required"
      });
    }

    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Update password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Change Password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully"
    });

  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Update Profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, username, profilePic, privacySettings } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if username is taken by another user
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken"
        });
      }
    }

    // Update fields
    if (fullName) user.fullName = fullName;
    if (username) user.username = username;
    if (profilePic) user.profilePic = profilePic;
    if (privacySettings) user.privacySettings = { ...user.privacySettings, ...privacySettings };

    await user.save();

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        profilePic: user.profilePic,
        privacySettings: user.privacySettings
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Block User
export const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot block yourself"
      });
    }

    const [currentUser, userToBlock] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!userToBlock) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Add to blocked users
    if (!currentUser.blockedUsers.includes(userId)) {
      currentUser.blockedUsers.push(userId);
    }

    // Remove from friends if they are friends
    currentUser.friends = currentUser.friends.filter(
      friend => friend.user.toString() !== userId
    );

    userToBlock.friends = userToBlock.friends.filter(
      friend => friend.user.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), userToBlock.save()]);

    res.json({
      success: true,
      message: "User blocked successfully"
    });

  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Unblock User
export const unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    
    // Remove from blocked users
    currentUser.blockedUsers = currentUser.blockedUsers.filter(
      id => id.toString() !== userId
    );

    await currentUser.save();

    res.json({
      success: true,
      message: "User unblocked successfully"
    });

  } catch (error) {
    console.error("Unblock user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get User Media
export const getUserMedia = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Check if user has permission to view media
    const [user, currentUser] = await Promise.all([
      User.findById(userId),
      User.findById(currentUserId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check privacy settings
    const isFriend = currentUser.isFriend(userId);
    if (user.privacySettings.profileVisibility === 'private' && !isFriend) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to view this user's media"
      });
    }

    // In a real implementation, you would query messages for media
    // This is a simplified version
    const media = []; // You would populate this from messages

    res.json({
      success: true,
      media,
      count: media.length
    });

  } catch (error) {
    console.error("Get user media error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account"
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password"
      });
    }

    // Soft delete - mark as inactive
    user.status = 'inactive';
    user.email = `deleted_${Date.now()}@deleted.com`;
    user.username = `deleted_${Date.now()}`;
    user.fullName = 'Deleted User';
    user.profilePic = '';
    await user.save();

    res.json({
      success: true,
      message: "Account deleted successfully"
    });

  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Email verification
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    user.emailVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully"
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Send Friend Request
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send friend request to yourself"
      });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check privacy settings
    if (targetUser.privacySettings.friendRequests === 'nobody') {
      return res.status(403).json({
        success: false,
        message: "This user is not accepting friend requests"
      });
    }

    if (targetUser.privacySettings.friendRequests === 'friends_of_friends') {
      const mutualFriends = currentUser.friends.some(friend1 => 
        targetUser.friends.some(friend2 => 
          friend1.user.toString() === friend2.user.toString()
        )
      );
      
      if (!mutualFriends) {
        return res.status(403).json({
          success: false,
          message: "This user only accepts friend requests from friends of friends"
        });
      }
    }

    // Check if already friends
    if (currentUser.isFriend(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user"
      });
    }

    // Check if request already exists
    if (targetUser.hasPendingRequest(currentUserId)) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent"
      });
    }

    // Check if blocked
    if (targetUser.blockedUsers.includes(currentUserId) || 
        currentUser.blockedUsers.includes(userId)) {
      return res.status(403).json({
        success: false,
        message: "Cannot send friend request"
      });
    }

    // Add friend request to target user
    targetUser.friendRequests.push({
      from: currentUserId,
      status: 'pending'
    });

    // Add sent request to current user
    currentUser.sentFriendRequests.push({
      to: userId,
      status: 'pending'
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      success: true,
      message: "Friend request sent successfully"
    });

  } catch (error) {
    console.error("Send friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Accept Friend Request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    
    // Find the pending request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === userId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    const request = currentUser.friendRequests[requestIndex];
    request.status = 'accepted';

    // Add to friends list for both users
    currentUser.friends.push({
      user: userId,
      addedAt: new Date()
    });

    const otherUser = await User.findById(userId);
    otherUser.friends.push({
      user: currentUserId,
      addedAt: new Date()
    });

    // Remove from sent requests
    const sentRequestIndex = otherUser.sentFriendRequests.findIndex(
      req => req.to.toString() === currentUserId.toString() && req.status === 'pending'
    );
    
    if (sentRequestIndex !== -1) {
      otherUser.sentFriendRequests[sentRequestIndex].status = 'accepted';
    }

    await Promise.all([currentUser.save(), otherUser.save()]);

    res.json({
      success: true,
      message: "Friend request accepted"
    });

  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reject Friend Request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    
    // Find and update the request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req.from.toString() === userId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    currentUser.friendRequests[requestIndex].status = 'rejected';

    // Update sent request in other user
    const otherUser = await User.findById(userId);
    const sentRequestIndex = otherUser.sentFriendRequests.findIndex(
      req => req.to.toString() === currentUserId.toString() && req.status === 'pending'
    );
    
    if (sentRequestIndex !== -1) {
      otherUser.sentFriendRequests[sentRequestIndex].status = 'rejected';
    }

    await Promise.all([currentUser.save(), otherUser.save()]);

    res.json({
      success: true,
      message: "Friend request rejected"
    });

  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Remove Friend
export const removeFriend = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const [currentUser, otherUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);

    if (!otherUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove from friends list
    currentUser.friends = currentUser.friends.filter(
      friend => friend.user.toString() !== userId
    );

    otherUser.friends = otherUser.friends.filter(
      friend => friend.user.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), otherUser.save()]);

    res.json({
      success: true,
      message: "Friend removed successfully"
    });

  } catch (error) {
    console.error("Remove friend error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get Friends List
export const getFriends = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('friends.user', 'fullName username profilePic lastSeen')
      .populate('friendRequests.from', 'fullName username profilePic');

    const friends = currentUser.friends.map(friend => ({
      ...friend.user.toObject(),
      friendshipDate: friend.addedAt,
      nickname: friend.nickname
    }));

    const pendingRequests = currentUser.friendRequests
      .filter(req => req.status === 'pending')
      .map(req => req.from);

    res.json({
      success: true,
      friends,
      pendingRequests,
      sentRequests: currentUser.sentFriendRequests
    });

  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Search Users with Privacy
// Updated searchUsers to show users for friend requests
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.user._id;

    if (!query || query.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters"
      });
    }

    const currentUser = await User.findById(currentUserId);
    
    // Search all users except current user
    const users = await User.find({
      $and: [
        {
          $or: [
            { fullName: { $regex: query, $options: 'i' } },
            { username: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: currentUserId } },
        { status: 'active' }
      ]
    }).select('fullName username profilePic lastSeen privacySettings');

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
        profilePic: userObj.profilePic,
        lastSeen: userObj.lastSeen,
        isFriend,
        friendshipStatus: isFriend ? 'friends' : 
                         hasSentRequest ? 'request_sent' : 
                         hasReceivedRequest ? 'request_received' : 'not_friends',
        hasSentRequest,
        hasReceivedRequest,
        // Show users even if they have private profiles for friend requests
        canSendRequest: user.privacySettings.friendRequests !== 'nobody'
      };
    });

    res.json({
      success: true,
      users: filteredUsers,
      count: filteredUsers.length
    });

  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};
// Get User Profile with Privacy
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const [user, currentUser] = await Promise.all([
      User.findById(userId).select('-password -verificationToken'),
      User.findById(currentUserId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check privacy settings
    const isFriend = currentUser.isFriend(userId);
    
    if (user.privacySettings.profileVisibility === 'private' && !isFriend) {
      return res.status(403).json({
        success: false,
        message: "This profile is private"
      });
    }

    if (user.privacySettings.profileVisibility === 'friends' && !isFriend) {
      return res.status(403).json({
        success: false,
        message: "This profile is only visible to friends"
      });
    }

    const profileData = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      profilePic: user.profilePic,
      lastSeen: user.lastSeen,
      isFriend,
      friendshipStatus: isFriend ? 'friends' : 
                       currentUser.hasPendingRequest(userId) ? 'request_sent' : 
                       user.hasPendingRequest(currentUserId) ? 'request_received' : 'not_friends'
    };

    // Only show mutual friends to friends
    if (isFriend) {
      const mutualFriends = await User.aggregate([
        {
          $match: { 
            _id: { $in: [
              ...currentUser.friends.map(f => f.user),
              ...user.friends.map(f => f.user)
            ]}
          }
        },
        {
          $project: {
            fullName: 1,
            username: 1,
            profilePic: 1
          }
        }
      ]);
      
      profileData.mutualFriends = mutualFriends;
      profileData.friendSince = currentUser.friends.find(
        f => f.user.toString() === userId
      )?.addedAt;
    }

    res.json({
      success: true,
      user: profileData
    });

  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};