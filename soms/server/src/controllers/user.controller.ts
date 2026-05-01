import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { HttpError } from '../middleware/error';
import { uploadedFileDataUrl } from '../middleware/upload';

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, search } = req.query as any;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const allowed = ['name', 'studentId', 'course', 'yearLevel'] as const;
    const update: Record<string, unknown> = {};
    for (const k of allowed) if (k in req.body) update[k] = req.body[k];
    const user = await User.findByIdAndUpdate(req.user!.id, update, { new: true });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) throw new HttpError(400, 'No file uploaded');
    const url = uploadedFileDataUrl(req.file);
    const user = await User.findByIdAndUpdate(
      req.user!.id,
      { avatarUrl: url },
      { new: true },
    );
    res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
