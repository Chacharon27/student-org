import multer from 'multer';
import path from 'path';
import { HttpError } from './error';

const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.pdf'];

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE_MB ?? 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!allowed.includes(ext)) {
      return cb(new HttpError(400, `File type ${ext} not allowed`));
    }
    cb(null, true);
  },
});

export function uploadedFileDataUrl(file: Express.Multer.File): string {
  return `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
}
