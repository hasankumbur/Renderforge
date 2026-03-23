import express from 'express';
import multer from 'multer';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { nanoid } from 'nanoid';
import { createAsset } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const uploadsDir = path.join(rootDir, 'uploads');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    cb(null, `${Date.now()}_${nanoid(8)}${ext}`);
  },
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'Yuklenecek dosya bulunamadi',
      code: 'FILE_REQUIRED',
    });
  }

  const hostUrl = process.env.HOST_URL || `${req.protocol}://${req.get('host')}`;
  const relativePath = `/uploads/${req.file.filename}`;

  const asset = createAsset({
    id: nanoid(12),
    filename: req.file.filename,
    original_name: req.file.originalname,
    path: relativePath,
    url: `${hostUrl}${relativePath}`,
    size: req.file.size,
  });

  return res.status(201).json({ success: true, data: asset });
});

export default router;
