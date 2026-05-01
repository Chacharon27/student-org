import multer from 'multer';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
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

export function uploadSingle(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    upload.any()(req, res, (err) => {
      if (err) return next(err);

      const files = (req.files as Express.Multer.File[] | undefined) ?? [];
      const matched = files.filter((file) => file.fieldname.trim() === fieldName);
      const unexpected = files.filter((file) => file.fieldname.trim() !== fieldName);

      if (unexpected.length > 0) {
        return next(
          new HttpError(
            400,
            `Unexpected file field: ${unexpected.map((file) => file.fieldname).join(', ')}`,
          ),
        );
      }

      if (matched.length > 1) {
        return next(new HttpError(400, `Only one ${fieldName} file is allowed`));
      }

      req.file = matched[0];
      next();
    });
  };
}
