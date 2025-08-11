import { Router } from 'express';
import env from '../config/env.js';
import { upload, makeFileRecord } from '../services/uploads.js';
import { uploadToCloudinary } from '../services/cloudinary.js';

const router = Router();

// POST /api/uploads/file  (field: file)
router.post('/file', upload.single('file'), async (req, res) => {
  try {
    if (env.fileStorage === 'local') {
      const rec = makeFileRecord(req.file);
      return res.json({ ok: true, file: rec });
    }
    // cloudinary path
    const buffer = req.file.buffer;
    const result = await uploadToCloudinary(buffer, req.file.originalname);
    return res.json({ ok: true, file: { provider: 'cloudinary', url: result.secure_url, mime: req.file.mimetype, size: req.file.size, name: req.file.originalname } });
  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ ok: false, error: 'Upload failed' });
  }
});

export default router;
