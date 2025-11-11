import { Router } from 'express';
import env from '../config/env.js';
import { upload, makeFileRecord } from '../services/uploads.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

const router = Router();

// POST /api/uploads/file  (field: file)
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ ok: false, error: 'No file uploaded' });
    }

    if (env.fileStorage === 'local') {
      const rec = makeFileRecord(req.file);
      return res.json({ ok: true, file: rec });
    }
    
    // Cloudinary path - validate configuration
    if (!env.cloudinary.cloudName || !env.cloudinary.apiKey || !env.cloudinary.apiSecret) {
      console.error('Cloudinary configuration missing');
      return res.status(500).json({ ok: false, error: 'File storage not configured' });
    }
    
    const buffer = req.file.buffer;
    const timestamp = Date.now();
    const filename = `${req.file.originalname.split('.')[0]}_${timestamp}`;
    
    const result = await uploadToCloudinary(buffer, filename);
    return res.json({ 
      ok: true, 
      file: { 
        provider: 'cloudinary', 
        url: result.secure_url, 
        mime: req.file.mimetype, 
        size: req.file.size, 
        name: req.file.originalname 
      } 
    });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ ok: false, error: 'Upload failed' });
  }
});

export default router;
