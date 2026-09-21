import fs from 'node:fs';
import multer from 'multer';
import { env } from '../config/env';
import { generateFileName } from '../utils/token';

const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);

function ensureCoversDir(): void {
  if (!fs.existsSync(env.coversDir)) {
    fs.mkdirSync(env.coversDir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    ensureCoversDir();
    callback(null, env.coversDir);
  },
  filename: (_req, file, callback) => {
    callback(null, generateFileName(file.originalname));
  },
});

export const coverUpload = multer({
  storage,
  limits: { fileSize: env.maxFileSizeBytes, files: 10 },
  fileFilter: (_req, file, callback) => {
    const extension = file.originalname
      .slice(file.originalname.lastIndexOf('.'))
      .toLowerCase();
    if (!ALLOWED_MIME.has(file.mimetype) || !ALLOWED_EXT.has(extension)) {
      callback(new Error('Only JPEG, PNG and WebP images are allowed'));
      return;
    }
    callback(null, true);
  },
});
