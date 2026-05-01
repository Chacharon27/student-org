import { Request, Response, NextFunction } from 'express';
import { Event } from '../models/Event';
import { Registration } from '../models/Registration';
import { HttpError } from '../middleware/error';
import { uploadedFileDataUrl } from '../middleware/upload';

export async function listEvents(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, search, organization, upcoming } = req.query as any;
    const filter: any = {};
    if (search) filter.title = { $regex: search, $options: 'i' };
    if (organization) filter.organization = organization;
    if (upcoming === 'true') filter.startsAt = { $gte: new Date() };
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Event.find(filter)
        .sort({ startsAt: 1 })
        .skip(skip)
        .limit(limit)
        .populate('organization', 'name slug logoUrl'),
      Event.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const ev = await Event.findById(req.params.id).populate(
      'organization',
      'name slug logoUrl',
    );
    if (!ev) throw new HttpError(404, 'Event not found');
    const registrationCount = await Registration.countDocuments({
      event: ev._id,
      status: 'registered',
    });
    res.json({ ...ev.toObject(), registrationCount });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const posterUrl = req.file ? uploadedFileDataUrl(req.file) : undefined;
    const ev = await Event.create({
      ...req.body,
      posterUrl,
      createdBy: req.user!.id,
    });
    res.status(201).json(ev);
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const update: any = { ...req.body };
    if (req.file) update.posterUrl = uploadedFileDataUrl(req.file);
    const ev = await Event.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!ev) throw new HttpError(404, 'Event not found');
    res.json(ev);
  } catch (err) {
    next(err);
  }
}

export async function deleteEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const ev = await Event.findByIdAndDelete(req.params.id);
    if (!ev) throw new HttpError(404, 'Event not found');
    await Registration.deleteMany({ event: ev._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
