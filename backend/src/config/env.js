import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5176',
  clientUrl: process.env.CLIENT_URL || `${process.env.FRONTEND_URL || 'http://localhost:5173'},${process.env.ADMIN_URL || 'http://localhost:5176'}`,
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  
  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017',
  mongoDbName: process.env.MONGO_DB_NAME || 'unityboard',
  
  // Authentication
  jwtSecret: process.env.JWT_SECRET || 'change_me_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // File Storage - Defaults to cloudinary for deployment readiness
  fileStorage: process.env.FILE_STORAGE || 'cloudinary',
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 10),
  
  // Cloudinary Configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'unityboard'
  },
  
  // AI Services
  cohere: {
    apiKey: process.env.COHERE_API_KEY || '',
    model: process.env.COHERE_MODEL || 'command-r-plus-08-2024',
    maxTokens: Number(process.env.AI_MAX_TOKENS || 512)
  },
  
  // Features
  enableSocket: String(process.env.ENABLE_SOCKET || 'true') === 'true',
  aiEnabled: String(process.env.AI_ENABLED || 'true') === 'true',
  
  // Admin
  adminEmail: process.env.ADMIN_EMAIL || 'admin@unityboard.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'admin123'
};

export default env;
