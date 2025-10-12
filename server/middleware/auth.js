// middleware/auth.js
import User from "../models/User.js";
import jwt from "jsonwebtoken";

export const protectRoute = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.headers.token) {
      token = req.headers.token;
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "No token provided" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId || decoded.id;
    
    if (!userId) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid token" 
      });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(401).json({ 
        success: false, 
        message: "Account is deactivated" 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    
    let message = "Invalid token";
    if (error.name === 'TokenExpiredError') {
      message = "Token expired";
    } else if (error.name === 'JsonWebTokenError') {
      message = "Malformed token";
    }
    
    res.status(401).json({ success: false, message });
  }
};

// Enhanced auth check with user details
// Add this function to AuthController.js
export const checkAuth = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -verificationToken -resetToken');
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
        privacySettings: user.privacySettings
      }
    });
  } catch (error) {
    console.error("Check auth error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};