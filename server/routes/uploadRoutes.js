// routes/uploadRoutes.js
import express from "express";
import { 
  uploadFile, 
  deleteFile, 
  uploadMultipleFiles, 
  uploadBase64File,
  getSignature,
  testCloudinaryConfig  // Add this import
} from "../controllers/uploadController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Upload single file (form-data)
router.post("/", protectRoute, uploadFile);

// Upload multiple files (form-data)
router.post("/multiple", protectRoute, uploadMultipleFiles);

// Upload base64 file (for client-side uploads)
router.post("/base64", protectRoute, uploadBase64File);

// Get upload signature for client-side uploads
router.get("/signature", protectRoute, getSignature);

// Test Cloudinary configuration
router.get("/config-test", protectRoute, testCloudinaryConfig);

// Delete file
router.delete("/", protectRoute, deleteFile);

// Test route
router.get("/test", protectRoute, (req, res) => {
  res.json({
    success: true,
    message: "Upload endpoint is working",
    user: req.user._id,
    timestamp: new Date().toISOString()
  });
});

export default router;