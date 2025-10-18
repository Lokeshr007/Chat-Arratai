import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import stream from "stream";
import dotenv from 'dotenv';

dotenv.config();

// Configure Cloudinary directly in the controller
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('🔧 Cloudinary Config Check:', {
    cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : 'MISSING',
    apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : 'MISSING',
    apiSecret: apiSecret ? '***' + apiSecret.substring(apiSecret.length - 4) : 'MISSING'
  });

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('❌ Missing Cloudinary environment variables');
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    console.log('✅ Cloudinary configured successfully');
    return true;
  } catch (error) {
    console.error('🚨 Cloudinary configuration failed:', error.message);
    return false;
  }
};

// Initialize Cloudinary
configureCloudinary();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/avi', 'video/mov', 'video/wmv',
      'audio/mpeg', 'audio/wav', 'audio/ogg',
      'application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'application/json',
      'application/zip', 'application/x-rar-compressed'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  },
});

// Enhanced upload function with better error handling
const uploadToCloudinary = (buffer, resourceType = 'auto', originalName = 'file') => {
  return new Promise((resolve, reject) => {
    console.log(`☁️ Starting Cloudinary upload - Type: ${resourceType}, Size: ${buffer.length} bytes`);
    
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: resourceType,
        folder: "chat-app",
        public_id: originalName.replace(/\.[^/.]+$/, ""),
        timeout: 60000,
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload stream error:', {
            message: error.message,
            http_code: error.http_code,
            name: error.name
          });
          
          if (error.http_code === 401) {
            reject(new Error('Cloudinary authentication failed - check your API credentials'));
          } else if (error.http_code === 400) {
            reject(new Error('Invalid upload request - file may be corrupted or too large'));
          } else if (error.message.includes('File size too large')) {
            reject(new Error('File size exceeds Cloudinary limits'));
          } else {
            reject(new Error(`Cloudinary upload failed: ${error.message}`));
          }
        } else {
          console.log('✅ Cloudinary upload successful:', {
            public_id: result.public_id,
            format: result.format,
            bytes: result.bytes,
            resource_type: result.resource_type
          });
          resolve(result);
        }
      }
    );
    
    uploadStream.on('error', (streamError) => {
      console.error('❌ Cloudinary stream error:', streamError);
      reject(new Error(`Cloudinary stream error: ${streamError.message}`));
    });

    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    } catch (pipeError) {
      console.error('❌ Buffer stream pipe error:', pipeError);
      reject(new Error(`Stream pipe error: ${pipeError.message}`));
    }
  });
};

// Get resource type from mimetype
const getResourceType = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype.startsWith('video/')) return 'video';
  if (mimetype.startsWith('audio/')) return 'video';
  return 'raw';
};

// Enhanced upload controller
export const uploadFile = async (req, res) => {
  try {
    console.log("📤 Upload request received");

    // Use multer middleware
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error("❌ Multer upload error:", err);
        return res.status(400).json({
          success: false,
          message: err.message,
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
        
        // Validate file
        if (req.file.size === 0) {
          return res.status(400).json({
            success: false,
            message: "File is empty",
            code: 'EMPTY_FILE'
          });
        }

        if (!req.file.buffer || req.file.buffer.length === 0) {
          return res.status(400).json({
            success: false,
            message: "File buffer is invalid",
            code: 'INVALID_BUFFER'
          });
        }

        // Upload to Cloudinary
        const resourceType = getResourceType(req.file.mimetype);
        console.log(`☁️ Uploading to Cloudinary with resource type: ${resourceType}`);
        
        const uploadResult = await uploadToCloudinary(req.file.buffer, resourceType, req.file.originalname);
        
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

        console.log("✅ File uploaded successfully to Cloudinary");

        res.json({
          success: true,
          message: "File uploaded successfully",
          file: fileInfo
        });
      } catch (uploadError) {
        console.error("❌ Cloudinary upload error:", uploadError);
        
        let errorMessage = "Failed to upload file to cloud storage";
        let errorCode = 'CLOUDINARY_ERROR';
        let statusCode = 500;
        
        if (uploadError.message.includes('authentication failed')) {
          errorMessage = "Cloud storage authentication failed - check configuration";
          errorCode = 'CLOUD_AUTH_ERROR';
          statusCode = 503;
        } else if (uploadError.message.includes('File size too large')) {
          errorMessage = "File size exceeds cloud storage limits";
          errorCode = 'FILE_TOO_LARGE';
          statusCode = 400;
        } else if (uploadError.message.includes('Invalid upload request')) {
          errorMessage = "File is corrupted or in invalid format";
          errorCode = 'INVALID_FILE';
          statusCode = 400;
        }
        
        res.status(statusCode).json({
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

// Test endpoint
export const testCloudinaryConfig = async (req, res) => {
  try {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const configStatus = {
      CLOUDINARY_CLOUD_NAME: cloudName ? `✓ Set (${cloudName.substring(0, 4)}...)` : '✗ MISSING',
      CLOUDINARY_API_KEY: apiKey ? `✓ Set (${apiKey.substring(0, 6)}...)` : '✗ MISSING',
      CLOUDINARY_API_SECRET: apiSecret ? '✓ Set (***)' : '✗ MISSING',
      NODE_ENV: process.env.NODE_ENV || 'not set'
    };

    res.json({
      success: true,
      config: configStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Config test failed",
      error: error.message
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