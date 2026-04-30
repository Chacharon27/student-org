import { Request, Response, NextFunction } from 'express';
import { Announcement } from '../models/Announcement';
import { HttpError } from '../middleware/error';

export async function listAnnouncements(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, search, organization } = req.query as any;
    const filter: any = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (organization) filter.organization = organization;
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Announcement.find(filter)
        .sort({ pinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('organization', 'name slug')
        .populate('createdBy', 'name'),
      Announcement.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const a = await Announcement.create({
      ...req.body,
      imageUrl,
      createdBy: req.user!.id,
    });
    res.status(201).json(a);
  } catch (err) {
    next(err);
  }
}

export async function updateAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    const update: any = { ...req.body };
    if (req.file) update.imageUrl = `/uploads/${req.file.filename}`;
    const a = await Announcement.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!a) throw new HttpError(404, 'Announcement not found');
    res.json(a);
  } catch (err) {
    next(err);
  }
}

export async function deleteAnnouncement(req: Request, res: Response, next: NextFunction) {
  try {
    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
