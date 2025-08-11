import fs from 'fs';
import path from 'path';
import env from '../config/env.js';
import multer from 'multer';

// Multer setup for local disk storage
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.resolve(process.cwd(), env.uploadsDir);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9_-]/gi, '_');
    cb(null, `${base}_${timestamp}${ext}`);
  }
});

export const upload = multer({
  storage: env.fileStorage === 'local' ? localStorage : multer.memoryStorage(),
  limits: { fileSize: env.maxUploadSizeMb * 1024 * 1024 }
});

// Utility: return a canonical URL to store in DB
// - local: relative path under uploads (e.g., /uploads/file.pdf)
// - cloudinary: secure_url from Cloudinary API
export function makeFileRecord(file) {
  if (!file) return null;
  if (env.fileStorage === 'local') {
    const rel = `/${env.uploadsDir}/${path.basename(file.path)}`.replace(/\\/g, '/');
    return { provider: 'local', url: rel, mime: file.mimetype, size: file.size, name: file.originalname };
  }
  // For cloud: the caller should pass in cloud result { secure_url, ... }
  return null;
}
