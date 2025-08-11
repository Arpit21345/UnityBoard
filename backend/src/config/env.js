import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  logLevel: process.env.LOG_LEVEL || 'info',
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 60000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  mongoUri: process.env.MONGO_URI || '',
  mongoDbName: process.env.MONGO_DB_NAME || 'unityboard',
  jwtSecret: process.env.JWT_SECRET || 'change_me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  fileStorage: process.env.FILE_STORAGE || 'local',
  uploadsDir: process.env.UPLOADS_DIR || 'uploads',
  maxUploadSizeMb: Number(process.env.MAX_UPLOAD_SIZE_MB || 10),
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    folder: process.env.CLOUDINARY_FOLDER || 'unityboard'
  },
  cohere: {
    apiKey: process.env.COHERE_API_KEY || '',
    model: process.env.COHERE_MODEL || 'command-light',
    maxTokens: Number(process.env.AI_MAX_TOKENS || 512)
  },
  enableSocket: String(process.env.ENABLE_SOCKET || 'false') === 'true'
};

export default env;
