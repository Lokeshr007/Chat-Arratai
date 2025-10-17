// controllers/AuthController.js - Complete with all exports
import User from "../models/User.js";
import { generateToken } from "../lib/utils.js";
import crypto from "crypto";
import nodemailer from "nodemailer";
import bcrypt from "bcryptjs";
import Group from "../models/Group.js";

// Enhanced email configuration with better error handling
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    socketTimeout: 15000,
    greetingTimeout: 10000,
    retries: 3,
    retryDelay: 1000
  });
};

let transporter = createTransporter();

// Verify email configuration with retry logic
const verifyEmailConfig = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await transporter.verify();
      console.log('✅ Email server is ready to send messages');
      return true;
    } catch (error) {
      console.warn(`❌ Email configuration attempt ${i + 1} failed:`, error.message);
      
      if (i === retries - 1) {
        console.error('🚨 Email service unavailable. Continuing without email functionality.');
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
      transporter = createTransporter();
    }
  }
};

// Initialize email on startup
verifyEmailConfig();

// Safe email sending function
export const sendEmailSafe = async (mailOptions, maxRetries = 2) => {
  if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_USER) {
    console.log('📧 Email disabled in development - no EMAIL_USER configured');
    return { success: true, skipped: true };
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_FROM || `"ChatApp" <${process.env.EMAIL_USER}>`,
        ...mailOptions
      });
      
      console.log('✅ Email sent successfully to:', mailOptions.to);
      return { success: true, info };
    } catch (error) {
      console.error(`❌ Email sending attempt ${attempt + 1} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.warn('📧 Email service unavailable - continuing without email');
        return { 
          success: false, 
          error: error.message,
          skipped: true 
        };
      }
      
      transporter = createTransporter();
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
};

// Signup with enhanced email verification
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

    // Generate verification token with expiry (24 hours)
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      verificationToken,
      verificationTokenExpiry
    });

    // Send verification email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    console.log('🔗 Generated verification URL:', verificationUrl);

    const mailOptions = {
      from: `"ChatApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - ChatApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Welcome to ChatApp! 🎉</h2>
          <p>Hello ${fullName},</p>
          <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p><strong>This verification link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            If you're having trouble clicking the button, copy and paste the URL above into your web browser.
          </p>
        </div>
      `
    };

    const emailResult = await sendEmailSafe(mailOptions);
    if (emailResult.success && !emailResult.skipped) {
      console.log(`✅ Verification email sent to: ${email}`);
    } else if (emailResult.skipped) {
      console.log(`📧 Email verification skipped for: ${email}`);
    }

    res.status(201).json({
      success: true,
      message: "Account created successfully! Please check your email for verification link.",
      userData: {
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

// Enhanced login with verification status
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
        message: "Please verify your email before logging in. Check your inbox or request a new verification link.",
        needsVerification: true,
        email: user.email
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
      userData: {
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

// Enhanced email verification
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required"
      });
    }

    const user = await User.findOne({ 
      verificationToken: token,
      verificationTokenExpiry: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification token"
      });
    }

    // Verify the email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.json({
      success: true,
      message: "Email verified successfully! You can now login."
    });
  } catch (error) {
    console.error("Email verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Resend verification email
export const resendVerification = async (req, res) => {
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
      return res.json({
        success: true,
        message: "If the email exists, a new verification link has been sent"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    console.log('🔗 Generated resend verification URL:', verificationUrl);

    const mailOptions = {
      from: `"ChatApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - ChatApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Verify Your Email</h2>
          <p>Hello ${user.fullName},</p>
          <p>You requested a new verification link. Click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const emailResult = await sendEmailSafe(mailOptions);
    if (emailResult.success && !emailResult.skipped) {
      console.log(`✅ Resent verification email to: ${email}`);
    } else if (emailResult.skipped) {
      console.log(`📧 Email resend skipped for: ${email}`);
    }

    res.json({
      success: true,
      message: "New verification link sent to your email"
    });

  } catch (error) {
    console.error("Resend verification error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Resend verification email with email parameter
export const resendVerificationEmail = async (req, res) => {
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
      return res.json({
        success: true,
        message: "If an account exists with this email, a new verification link has been sent"
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified"
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    user.verificationToken = verificationToken;
    user.verificationTokenExpiry = verificationTokenExpiry;
    await user.save();

    // Send verification email with correct URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const verificationUrl = `${clientUrl}/verify-email?token=${verificationToken}`;

    console.log('🔗 Resent verification URL:', verificationUrl);

    const mailOptions = {
      from: `"ChatApp" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - ChatApp',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Verify Your Email</h2>
          <p>Hello ${user.fullName},</p>
          <p>You requested a new verification link. Click the button below to verify your email:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; color: #666;">
            <a href="${verificationUrl}">${verificationUrl}</a>
          </p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    const emailResult = await sendEmailSafe(mailOptions);
    
    if (emailResult.success && !emailResult.skipped) {
      console.log(`✅ Resent verification email to: ${email}`);
    } else if (emailResult.skipped) {
      console.log(`📧 Email resend skipped for: ${email}`);
    }

    res.json({
      success: true,
      message: "New verification link sent to your email"
    });

  } catch (error) {
    console.error("Resend verification email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

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
      return res.json({
        success: true,
        message: "If the email exists, a reset link has been sent"
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // Send reset email
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    
    const mailOptions = {
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
    };

    await sendEmailSafe(mailOptions);

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
    const media = [];

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

// Send Friend Request
// Send Friend Request - COMPLETELY FIXED VERSION
export const sendFriendRequest = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    console.log('📥 Received friend request:', { 
      from: currentUserId, 
      to: userId 
    });

    // Validate input
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send friend request to yourself"
      });
    }

    // Find both users
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

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found"
      });
    }

    // Check if already friends using the helper method
    if (currentUser.isFriend(userId)) {
      return res.status(400).json({
        success: false,
        message: "You are already friends with this user"
      });
    }

    // Check if request already exists (sent by current user to target)
    const hasPendingRequest = targetUser.friendRequests.some(
      req => req.from.toString() === currentUserId.toString() && req.status === 'pending'
    );
    
    if (hasPendingRequest) {
      return res.status(400).json({
        success: false,
        message: "Friend request already sent"
      });
    }

    // Check if target user has already sent a request to current user
    const hasReceivedRequest = currentUser.friendRequests.some(
      req => req.from.toString() === userId && req.status === 'pending'
    );

    if (hasReceivedRequest) {
      return res.status(400).json({
        success: false,
        message: "This user has already sent you a friend request. Please check your pending requests."
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

    // Check privacy settings
    const privacy = targetUser.privacySettings || {};
    
    if (privacy.friendRequests === 'nobody') {
      return res.status(403).json({
        success: false,
        message: "This user is not accepting friend requests"
      });
    }

    if (privacy.friendRequests === 'friends_of_friends') {
      // Check if they have mutual friends
      const currentUserFriendIds = currentUser.friends.map(f => f.user.toString());
      const targetUserFriendIds = targetUser.friends.map(f => f.user.toString());
      
      const mutualFriends = currentUserFriendIds.some(friendId => 
        targetUserFriendIds.includes(friendId)
      );
      
      if (!mutualFriends) {
        return res.status(403).json({
          success: false,
          message: "This user only accepts friend requests from friends of friends"
        });
      }
    }

    console.log('✅ All checks passed, creating friend request...');

    // Create friend request object
    const friendRequest = {
      from: currentUserId,
      status: 'pending',
      createdAt: new Date()
    };

    const sentRequest = {
      to: userId,
      status: 'pending',
      createdAt: new Date()
    };

    // Add friend request to target user
    targetUser.friendRequests.push(friendRequest);

    // Add sent request to current user
    currentUser.sentFriendRequests.push(sentRequest);

    await Promise.all([currentUser.save(), targetUser.save()]);

    console.log('✅ Friend request saved successfully');

    // Get the actual request ID that was created
    const savedRequest = targetUser.friendRequests[targetUser.friendRequests.length - 1];

    // Emit socket event if socket is available
    try {
      if (req.io) {
        req.io.to(targetUser._id.toString()).emit('friendRequestReceived', {
          fromUser: {
            _id: currentUser._id,
            fullName: currentUser.fullName,
            username: currentUser.username,
            profilePic: currentUser.profilePic
          },
          requestId: savedRequest._id,
          timestamp: new Date()
        });
        console.log('📡 Socket event emitted to target user');
      }
    } catch (socketError) {
      console.warn('⚠️ Could not emit socket event:', socketError);
      // Continue anyway - socket is optional
    }

    res.json({
      success: true,
      message: "Friend request sent successfully",
      requestId: savedRequest._id
    });

  } catch (error) {
    console.error("❌ Send friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Remove Friend
export const removeFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const [currentUser, friendUser] = await Promise.all([
      User.findById(currentUserId),
      User.findById(friendId)
    ]);

    if (!friendUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Remove from friends list
    currentUser.friends = currentUser.friends.filter(
      friend => friend.user.toString() !== friendId
    );

    friendUser.friends = friendUser.friends.filter(
      friend => friend.user.toString() !== currentUserId.toString()
    );

    await Promise.all([currentUser.save(), friendUser.save()]);

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
// Get Friends List - UPDATED VERSION
export const getFriends = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('friends.user', 'fullName username profilePic lastSeen email')
      .populate('friendRequests.from', 'fullName username profilePic email')
      .populate('sentFriendRequests.to', 'fullName username profilePic email');

    const friends = currentUser.friends.map(friend => ({
      ...friend.user.toObject(),
      friendshipDate: friend.addedAt,
      nickname: friend.nickname
    }));

    const pendingRequests = currentUser.friendRequests
      .filter(req => req.status === 'pending')
      .map(req => ({
        _id: req._id,
        from: req.from,
        createdAt: req.createdAt
      }));

    const sentRequests = currentUser.sentFriendRequests
      .filter(req => req.status === 'pending')
      .map(req => ({
        _id: req._id,
        to: req.to,
        createdAt: req.createdAt
      }));

    res.json({
      success: true,
      friends,
      pendingRequests,
      sentRequests
    });

  } catch (error) {
    console.error("Get friends error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

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

// Send friend request by email
export const sendFriendRequestByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    const currentUserId = req.user._id;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required"
      });
    }

    // Find user by email
    const targetUser = await User.findOne({ email });
    if (!targetUser) {
      return res.status(404).json({
        success: false,
        message: "User with this email not found"
      });
    }

    if (targetUser._id.toString() === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "Cannot send friend request to yourself"
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Check if already friends
    if (currentUser.isFriend(targetUser._id)) {
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

    // Check privacy settings
    if (targetUser.privacySettings.friendRequests === 'nobody') {
      return res.status(403).json({
        success: false,
        message: "This user is not accepting friend requests"
      });
    }

    if (targetUser.privacySettings.friendRequests === 'friends_of_friends') {
      // Check if they have mutual friends
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

    // Add friend request to target user
    targetUser.friendRequests.push({
      from: currentUserId,
      status: 'pending'
    });

    // Add sent request to current user
    currentUser.sentFriendRequests.push({
      to: targetUser._id,
      status: 'pending'
    });

    await Promise.all([currentUser.save(), targetUser.save()]);

    res.json({
      success: true,
      message: "Friend request sent successfully",
      request: {
        _id: targetUser.friendRequests[targetUser.friendRequests.length - 1]._id,
        toUserId: targetUser._id
      }
    });

  } catch (error) {
    console.error("Send friend request by email error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Get pending friend requests
export const getPendingRequests = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('friendRequests.from', 'fullName username profilePic email');

    const pendingRequests = currentUser.friendRequests
      .filter(req => req.status === 'pending')
      .map(req => ({
        _id: req._id,
        from: req.from,
        createdAt: req.createdAt
      }));

    res.json({
      success: true,
      pendingRequests
    });

  } catch (error) {
    console.error("Get pending requests error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Accept friend request by request ID
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    
    // Find the pending request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req._id.toString() === requestId && req.status === 'pending'
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
      user: request.from
    });

    const otherUser = await User.findById(request.from);
    otherUser.friends.push({
      user: currentUserId
    });

    // Update sent request status
    const sentRequestIndex = otherUser.sentFriendRequests.findIndex(
      req => req.to.toString() === currentUserId.toString() && req.status === 'pending'
    );
    
    if (sentRequestIndex !== -1) {
      otherUser.sentFriendRequests[sentRequestIndex].status = 'accepted';
    }

    await Promise.all([currentUser.save(), otherUser.save()]);

    res.json({
      success: true,
      message: "Friend request accepted",
      friendRequest: request,
      user: currentUser
    });

  } catch (error) {
    console.error("Accept friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

// Reject friend request by request ID
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    
    // Find and update the request
    const requestIndex = currentUser.friendRequests.findIndex(
      req => req._id.toString() === requestId && req.status === 'pending'
    );

    if (requestIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Friend request not found"
      });
    }

    currentUser.friendRequests[requestIndex].status = 'rejected';

    // Update sent request in other user
    const otherUser = await User.findById(currentUser.friendRequests[requestIndex].from);
    const sentRequestIndex = otherUser.sentFriendRequests.findIndex(
      req => req.to.toString() === currentUserId.toString() && req.status === 'pending'
    );
    
    if (sentRequestIndex !== -1) {
      otherUser.sentFriendRequests[sentRequestIndex].status = 'rejected';
    }

    await Promise.all([currentUser.save(), otherUser.save()]);

    res.json({
      success: true,
      message: "Friend request rejected",
      user: currentUser
    });

  } catch (error) {
    console.error("Reject friend request error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};