import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    maxlength: [50, "Full name cannot exceed 50 characters"]
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username cannot exceed 20 characters"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  profilePic: {
    type: String,
    default: ""
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  lastSeen: {
    type: Date,
    default: Date.now
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  verificationTokenExpiry: Date,
  resetToken: String,
  resetTokenExpiry: Date,
  
  // Friends system
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    nickname: String
  }],
  
  // Friend requests received
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Friend requests sent
  sentFriendRequests: [{
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Block system
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    friendRequests: {
      type: String,
      enum: ['everyone', 'friends_of_friends', 'nobody'],
      default: 'everyone'
    },
    lastSeen: {
      type: String,
      enum: ['everyone', 'friends', 'nobody'],
      default: 'everyone'
    }
  }
}, {
  timestamps: true
});

// Index for better performance
userSchema.index({ email: 1 });
userSchema.index({ username: 1 });
userSchema.index({ "friends.user": 1 });
userSchema.index({ "friendRequests.from": 1 });

// Password hashing middleware
userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Check if user is friend
userSchema.methods.isFriend = function(userId) {
  return this.friends.some(friend => friend.user.toString() === userId.toString());
};

// Check if has pending request from user
userSchema.methods.hasPendingRequest = function(userId) {
  return this.friendRequests.some(
    req => req.from.toString() === userId.toString() && req.status === 'pending'
  );
};

// Check if has sent pending request to user
userSchema.methods.hasSentPendingRequest = function(userId) {
  return this.sentFriendRequests.some(
    req => req.to.toString() === userId.toString() && req.status === 'pending'
  );
};

// Virtual for online status
userSchema.virtual('isOnline').get(function() {
  return this.lastSeen > new Date(Date.now() - 5 * 60 * 1000); // 5 minutes
});

export default mongoose.model("User", userSchema);