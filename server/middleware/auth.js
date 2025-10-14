// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, no token provided"
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "User not found"
        });
      }

      if (user.status !== 'active') {
        return res.status(401).json({
          success: false,
          message: "Account is deactivated"
        });
      }

      req.user = user;
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Not authorized, invalid token"
      });
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Server error in authentication"
    });
  }
};

export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    res.json({
      success: true,
      user: {
        _id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        profilePic: user.profilePic,
        status: user.status,
        lastSeen: user.lastSeen,
        privacySettings: user.privacySettings,
        friends: user.friends,
        friendRequests: user.friendRequests,
        sentFriendRequests: user.sentFriendRequests
      }
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Error checking authentication"
    });
  }
};