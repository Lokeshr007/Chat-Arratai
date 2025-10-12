import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

// Signup Controller
export const signup = async (req, res) => {
    const { fullName, email, password, bio } = req.body;

    try {
        if (!fullName || !email || !password || !bio) {
            return res.json({ success: false, message: "Missing Details" });
        }
        const user = await User.findOne({ email });

        if (user) {
            return res.json({ success: false, message: "User already exists" }); // fixed message
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create({ fullName, email, password: hashedPassword, bio }); // added await .create()

        const token = generateToken(newUser._id);

        res.json({ success: true, userData: newUser, token, message: "Account created successfully" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Login Controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // check password validity
        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        // generate JWT token
        const token = generateToken(user._id);

        // send response
        res.json({
            success: true,
            userData: user,
            token,
            message: "Login successful",
        });
    } catch (error) {
        console.log("Error in login:", error.message);
        res.json({ success: false, message: error.message });
    }
};


// Update Profile Controller
export const updateProfile = async (req, res) => {
    try {
        const { profilePic, bio, fullName } = req.body;
        const userId = req.user._id;
        let updatedUser; // fixed naming

        if (!profilePic) {
            updatedUser = await User.findByIdAndUpdate(userId, { bio, fullName }, { new: true });
        } else {
            const upload = await cloudinary.uploader.upload(profilePic);
            updatedUser = await User.findByIdAndUpdate(userId, { profilePic: upload.secure_url, bio, fullName }, { new: true });
        }

        res.json({ success: true, user: updatedUser, message: "Profile updated successfully" });
    } catch (error) {
        console.log("Error while updating profile ", error.message);
        res.json({ success: false, message: error.message });
    }
};
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    // Here we just allow to reset password directly (no OTP)
    // Default new password or send a link (we will accept newPassword in frontend)
    res.json({ success: true, message: "You can now reset your password" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    if (!email || !newPassword) return res.json({ success: false, message: "Missing fields" });

    const user = await User.findOne({ email });
    if (!user) return res.json({ success: false, message: "User not found" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};