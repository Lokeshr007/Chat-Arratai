import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import stream from "stream";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types including text files
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'application/json', // Added text files
      'application/zip', 'application/x-rar-compressed' // Added archives
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  },
});

// Helper function to upload buffer to Cloudinary - FIXED VERSION
const uploadToCloudinary = (buffer, resourceType = 'auto') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType, // FIXED: was using undefined variable
        folder: "chat-app",
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    
    const bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    bufferStream.pipe(uploadStream);
  });
};

// Get resource type from mimetype
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'video'; // Cloudinary uses 'video' for audio
  return 'raw'; // Changed from 'auto' to 'raw' for text files
};

// Upload single file - ENHANCED VERSION
export const uploadFile = async (req, res) => {
  try {
    console.log("📤 Upload request received");
    
    // Use multer middleware
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error("❌ Upload error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
          code: 'UPLOAD_ERROR'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
          code: 'NO_FILE'
        });
      }

      try {
        console.log(`📁 Processing file: ${req.file.originalname}, Type: ${req.file.mimetype}, Size: ${req.file.size} bytes`);
        
        // Validate file size
        if (req.file.size === 0) {
          return res.status(400).json({
            success: false,
            message: "File is empty",
            code: 'EMPTY_FILE'
          });
        }

        // Upload to Cloudinary
        const resourceType = getResourceType(req.file.mimetype);
        console.log(`☁️ Uploading to Cloudinary with resource type: ${resourceType}`);
        
        const uploadResult = await uploadToCloudinary(req.file.buffer, resourceType);
        
        const fileInfo = {
          public_id: uploadResult.public_id,
          url: uploadResult.secure_url,
          format: uploadResult.format,
          resource_type: uploadResult.resource_type,
          bytes: uploadResult.bytes,
          original_filename: req.file.originalname,
          secure_url: uploadResult.secure_url,
          created_at: uploadResult.created_at,
          mimetype: req.file.mimetype
        };

        console.log("✅ File uploaded successfully to Cloudinary:", fileInfo);

        res.json({
          success: true,
          message: "File uploaded successfully",
          file: fileInfo
        });
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        
        // More specific error messages
        let errorMessage = "Failed to upload file to cloud storage";
        let errorCode = 'CLOUDINARY_ERROR';
        
        if (uploadError.message.includes('File size too large')) {
          errorMessage = "File size exceeds maximum limit";
          errorCode = 'FILE_TOO_LARGE';
        } else if (uploadError.message.includes('format')) {
          errorMessage = "Unsupported file format";
          errorCode = 'UNSUPPORTED_FORMAT';
        }
        
        res.status(500).json({
          success: false,
          message: errorMessage,
          code: errorCode,
          details: process.env.NODE_ENV === 'development' ? uploadError.message : undefined
        });
      }
    });
  } catch (error) {
    console.error("🚨 Upload controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during upload",
      code: 'SERVER_ERROR'
    });
  }
};

// Upload multiple files
export const uploadMultipleFiles = async (req, res) => {
  try {
    console.log("📤 Multiple upload request received");
    
    upload.array('files', 10)(req, res, async (err) => {
      if (err) {
        console.error("❌ Multiple upload error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "Files upload failed"
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      try {
        const filesInfo = [];
        
        // Upload all files to Cloudinary
        for (const file of req.files) {
          console.log(`📁 Processing file: ${file.originalname}`);
          
          const resourceType = getResourceType(file.mimetype);
          const uploadResult = await uploadToCloudinary(file.buffer, resourceType);
          
          filesInfo.push({
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
            format: uploadResult.format,
            resource_type: uploadResult.resource_type,
            bytes: uploadResult.bytes,
            original_filename: file.originalname,
            secure_url: uploadResult.secure_url,
            created_at: uploadResult.created_at,
            mimetype: file.mimetype
          });
        }

        console.log(`✅ ${filesInfo.length} files uploaded successfully to Cloudinary`);

        res.json({
          success: true,
          message: `${filesInfo.length} files uploaded successfully`,
          files: filesInfo
        });
      } catch (uploadError) {
        console.error("❌ Cloudinary multiple upload error:", uploadError);
        res.status(500).json({
          success: false,
          message: "Failed to upload files to cloud storage"
        });
      }
    });
  } catch (error) {
    console.error("🚨 Multiple upload controller error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during multiple upload"
    });
  }
};

// Upload base64 files (for client-side uploads)
export const uploadBase64File = async (req, res) => {
  try {
    const { file, filename = 'file', resourceType = 'auto' } = req.body;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file data provided"
      });
    }

    console.log(`📤 Base64 upload request for: ${filename}`);

    // Upload base64 to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(file, {
      resource_type: resourceType,
      folder: "chat-app",
      public_id: filename,
    });

    const fileInfo = {
      public_id: uploadResult.public_id,
      url: uploadResult.secure_url,
      format: uploadResult.format,
      resource_type: uploadResult.resource_type,
      bytes: uploadResult.bytes,
      original_filename: filename,
      secure_url: uploadResult.secure_url,
      created_at: uploadResult.created_at,
    };

    console.log("✅ Base64 file uploaded successfully:", fileInfo);

    res.json({
      success: true,
      message: "File uploaded successfully",
      file: fileInfo
    });

  } catch (error) {
    console.error("❌ Base64 upload error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to upload file"
    });
  }
};

// Delete file
export const deleteFile = async (req, res) => {
  try {
    const { public_id, resource_type = 'image' } = req.body;

    if (!public_id) {
      return res.status(400).json({
        success: false,
        message: "File public_id is required"
      });
    }

    const result = await cloudinary.uploader.destroy(public_id, {
      resource_type: resource_type
    });

    if (result.result === 'ok') {
      res.json({
        success: true,
        message: "File deleted successfully"
      });
    } else {
      res.status(404).json({
        success: false,
        message: "File not found or already deleted"
      });
    }
  } catch (error) {
    console.error("❌ Delete file error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error during file deletion"
    });
  }
};

// Get upload signature (for client-side direct uploads)
export const getSignature = async (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = {
      timestamp: timestamp,
      folder: "chat-app"
    };

    const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);

    res.json({
      success: true,
      signature,
      timestamp,
      api_key: process.env.CLOUDINARY_API_KEY,
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME
    });
  } catch (error) {
    console.error("❌ Get signature error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate upload signature"
    });
  }
};