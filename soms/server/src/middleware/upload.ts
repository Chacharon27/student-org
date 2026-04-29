import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { HttpError } from './error';

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safe =
      Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, safe);
  },
});

const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.pdf'];

export const upload = multer({
  storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new HttpError(400, `File type ${ext} not allowed`));
    }
    cb(null, true);
  },
});
