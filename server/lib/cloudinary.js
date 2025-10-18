// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Enhanced Cloudinary configuration with validation and error handling
const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log('🔧 Cloudinary Config Check:', {
    cloudName: cloudName ? `${cloudName.substring(0, 4)}...` : 'MISSING',
    apiKey: apiKey ? `${apiKey.substring(0, 6)}...` : 'MISSING',
    apiSecret: apiSecret ? '***' + apiSecret.substring(apiSecret.length - 4) : 'MISSING',
    nodeEnv: process.env.NODE_ENV
  });

  // Validate environment variables
  if (!cloudName || !apiKey || !apiSecret) {
    const missing = [];
    if (!cloudName) missing.push('CLOUDINARY_CLOUD_NAME');
    if (!apiKey) missing.push('CLOUDINARY_API_KEY');
    if (!apiSecret) missing.push('CLOUDINARY_API_SECRET');
    
    console.error('❌ Missing Cloudinary environment variables:', missing.join(', '));
    console.error('💡 Please check your .env file and ensure all Cloudinary variables are set');
    
    // Don't throw error to allow server to start, but log the issue
    return false;
  }

  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true, // Ensure SSL
      timeout: 60000, // 60 second timeout
    });

    console.log('✅ Cloudinary configured successfully');
    return true;
  } catch (error) {
    console.error('🚨 Cloudinary configuration failed:', error.message);
    return false;
  }
};

// Test Cloudinary connection
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection test successful:', result);
    return true;
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', {
      message: error.message,
      http_code: error.http_code,
      name: error.name
    });
    
    // Provide specific error messages
    if (error.http_code === 401) {
      console.error('🔐 Cloudinary Authentication Failed:');
      console.error('   - Check your CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET');
      console.error('   - Verify your Cloudinary account is active');
      console.error('   - Check if your IP is allowed in Cloudinary settings');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🌐 Network Error: Cannot connect to Cloudinary');
      console.error('   - Check your internet connection');
      console.error('   - Verify Cloudinary service is available');
    }
    
    return false;
  }
};

// Initialize Cloudinary
const cloudinaryInitialized = configureCloudinary();

export { cloudinary, testCloudinaryConnection, cloudinaryInitialized };
export default cloudinary;