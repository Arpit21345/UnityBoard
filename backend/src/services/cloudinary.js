import env from '../config/env.js';
import { v2 as cloudinary } from 'cloudinary';

export function configureCloudinary() {
  if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
    throw new Error('Cloudinary env not set');
  }
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret
  });
  return cloudinary;
}

// Upload a buffer (for memoryStorage) to Cloudinary; supports images and PDFs
export async function uploadToCloudinary(buffer, filename, folder = env.cloudinary.folder) {
  const cld = configureCloudinary();
  return new Promise((resolve, reject) => {
    const stream = cld.uploader.upload_stream({
      folder,
      resource_type: 'auto', // auto detects images, pdf, video
      public_id: filename
    }, (error, result) => {
      if (error) return reject(error);
      resolve(result);
    });
    stream.end(buffer);
  });
}
