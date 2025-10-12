import express from "express";
import { uploadFile, deleteFile, uploadMultipleFiles } from "../controllers/uploadController.js";
import { protectRoute } from "../middleware/auth.js";

const router = express.Router();

// Upload single file
router.post("/", protectRoute, uploadFile);

// Upload multiple files
router.post("/multiple", protectRoute, uploadMultipleFiles);

// Delete file
router.delete("/", protectRoute, deleteFile);

export default router;