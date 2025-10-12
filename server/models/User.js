// models/User.js - Add friend system fields
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Full name must be at least 2 characters"],
    maxlength: [50, "Full name cannot exceed 50 characters"]
  },
  username: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"],
    maxlength: [20, "Username cannot exceed 20 characters"],
    match: [/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers and underscores"]
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      "Please enter a valid email"
    ]
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,

   resetToken: String,
   resetTokenExpiry: Date,
  
  // Enhanced Friend System
  friends: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    nickname: String
  }],
  
  friendRequests: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  sentFriendRequests: [{
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    },
    sentAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  
  lastSeen: {
    type: Date,
    default: Date.now
  },
  
  // Enhanced Privacy Settings
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'friends', 'private'],
      default: 'public'
    },
    onlineStatus: {
      type: String,
      enum: ['visible', 'hidden'],
      default: 'visible'
    },
    friendRequests: {
      type: String,
      enum: ['everyone', 'friends_of_friends', 'nobody'],
      default: 'everyone'
    },
    messageRequests: {
      type: String,
      enum: ['everyone', 'friends', 'nobody'],
      default: 'everyone'
    }
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});


// models/User.js - Make sure these methods exist
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.isFriend = function (userId) {
  return this.friends.some(friend => friend.user.toString() === userId.toString());
};

userSchema.methods.hasPendingRequest = function (userId) {
  return this.friendRequests.some(
    req => req.from.toString() === userId.toString() && req.status === 'pending'
  );
};

// Hide sensitive information when converting to JSON
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.verificationToken;
  return user;
};

export default mongoose.model("User", userSchema);