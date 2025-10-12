import cloudinary from "../lib/cloudinary.js";

export const uploadFile = async (req, res) => {
  try {
    const { file, resourceType = "auto" } = req.body;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: "No file provided" 
      });
    }

    // 🆕 Extract user info for folder organization
    const userId = req.user?._id;
    
    console.log(`📁 Upload request from user: ${userId || 'anonymous'}`);
    console.log(`📄 Resource type: ${resourceType}`);

    // If URL, skip upload; else upload base64
    if (file.startsWith('http')) {
      console.log("🌐 URL provided, skipping upload");
      return res.json({ 
        success: true, 
        url: file, 
        public_id: null,
        uploadedBy: userId || null 
      });
    }

    // Validate base64 format
    if (!file.startsWith('data:')) {
      return res.status(400).json({ 
        success: false, 
        message: "Invalid file format. Expected base64 data URL or HTTP URL" 
      });
    }

    console.log("☁️ Uploading to Cloudinary...");
    
    // 🆕 Create folder structure based on user and resource type
    let folder = "chat_app/media";
    if (userId) {
      folder = `chat_app/users/${userId}/${resourceType === 'video' ? 'videos' : 'media'}`;
    }

    const uploadOptions = {
      resource_type: resourceType, // auto, image, video, raw
      folder: folder,
      timeout: 60000, // 60 seconds timeout
      quality: "auto", // Optimize quality
      fetch_format: "auto", // Auto format
      chunk_size: 6000000, // 6MB chunks for large files
    };

    // 🆕 Additional options for videos
    if (resourceType === 'video') {
      uploadOptions.quality = 'auto:good';
      uploadOptions.bit_rate = '500k';
    }

    const uploadResponse = await cloudinary.uploader.upload(file, uploadOptions);

    console.log("✅ Upload successful:", {
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      resource_type: uploadResponse.resource_type,
      duration: uploadResponse.duration,
      uploadedBy: userId || 'anonymous'
    });

    res.json({
      success: true,
      url: uploadResponse.secure_url,
      public_id: uploadResponse.public_id,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      resource_type: uploadResponse.resource_type,
      duration: uploadResponse.duration,
      uploadedBy: userId
    });

  } catch (err) {
    console.error("❌ Upload error:", err);
    
    // Better error messages based on error type
    let message = "Upload failed";
    let statusCode = 500;

    if (err.message.includes("File size too large")) {
      message = "File size too large. Maximum 10MB allowed.";
      statusCode = 413;
    } else if (err.message.includes("Invalid file")) {
      message = "Invalid file format";
      statusCode = 400;
    } else if (err.message.includes("timeout")) {
      message = "Upload timeout. Please try again.";
      statusCode = 408;
    } else if (err.message.includes("Unsupported format")) {
      message = "Unsupported file format";
      statusCode = 415;
    }

    res.status(statusCode).json({ 
      success: false, 
      message: message,
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { public_id } = req.body;
    
    if (!public_id) {
      return res.status(400).json({ 
        success: false, 
        message: "No public_id provided" 
      });
    }

    console.log(`🗑️ Deleting file: ${public_id}`);

    const deleteResult = await cloudinary.uploader.destroy(public_id);

    if (deleteResult.result !== 'ok') {
      return res.status(404).json({ 
        success: false, 
        message: "File not found or already deleted" 
      });
    }

    console.log("✅ File deleted successfully");
    res.json({ 
      success: true, 
      message: "File deleted successfully" 
    });

  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Delete failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};

export const uploadMultipleFiles = async (req, res) => {
  try {
    const { files, resourceType = "auto" } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: "No files provided" 
      });
    }

    // Limit number of files
    if (files.length > 10) {
      return res.status(400).json({ 
        success: false, 
        message: "Maximum 10 files allowed per upload" 
      });
    }

    const userId = req.user?._id;
    console.log(`📁 Multiple upload request from user: ${userId || 'anonymous'}, Files: ${files.length}`);

    const uploadPromises = files.map(async (file, index) => {
      try {
        // Skip upload for URLs
        if (file.startsWith('http')) {
          return {
            success: true,
            url: file,
            public_id: null,
            uploadedBy: userId || null
          };
        }

        // Validate base64 format
        if (!file.startsWith('data:')) {
          throw new Error("Invalid file format");
        }

        const folder = userId 
          ? `chat_app/users/${userId}/media`
          : "chat_app/anon/media";

        const uploadOptions = {
          resource_type: resourceType,
          folder: folder,
          quality: "auto",
          fetch_format: "auto",
        };

        const uploadResponse = await cloudinary.uploader.upload(file, uploadOptions);
        
        return {
          success: true,
          url: uploadResponse.secure_url,
          public_id: uploadResponse.public_id,
          format: uploadResponse.format,
          bytes: uploadResponse.bytes,
          resource_type: uploadResponse.resource_type,
          uploadedBy: userId
        };
      } catch (error) {
        console.error(`❌ Error uploading file ${index + 1}:`, error.message);
        return {
          success: false,
          error: error.message,
          index: index
        };
      }
    });

    const results = await Promise.all(uploadPromises);
    
    const successfulUploads = results.filter(result => result.success);
    const failedUploads = results.filter(result => !result.success);

    console.log(`✅ Multiple upload completed: ${successfulUploads.length} successful, ${failedUploads.length} failed`);

    res.json({
      success: true,
      message: `Uploaded ${successfulUploads.length} files successfully`,
      results: results,
      successful: successfulUploads.length,
      failed: failedUploads.length
    });

  } catch (err) {
    console.error("❌ Multiple upload error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Multiple upload failed",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};