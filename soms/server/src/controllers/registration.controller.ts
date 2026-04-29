import { Request, Response, NextFunction } from 'express';
import { Registration } from '../models/Registration';
import { Event } from '../models/Event';
import { HttpError } from '../middleware/error';

export async function registerForEvent(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params;
    const ev = await Event.findById(eventId);
    if (!ev) throw new HttpError(404, 'Event not found');
    if (ev.capacity > 0) {
      const count = await Registration.countDocuments({
        event: eventId,
        status: 'registered',
      });
      if (count >= ev.capacity) throw new HttpError(400, 'Event is full');
    }
    const dup = await Registration.findOne({ user: req.user!.id, event: eventId });
    if (dup && dup.status === 'registered')
      throw new HttpError(409, 'Already registered');
    const reg = dup
      ? await Registration.findByIdAndUpdate(
          dup._id,
          { status: 'registered' },
          { new: true },
        )
      : await Registration.create({ user: req.user!.id, event: eventId });
    res.status(201).json(reg);
  } catch (err) {
    next(err);
  }
}

export async function cancelRegistration(req: Request, res: Response, next: NextFunction) {
  try {
    const reg = await Registration.findOneAndUpdate(
      { user: req.user!.id, event: req.params.eventId },
      { status: 'cancelled' },
      { new: true },
    );
    if (!reg) throw new HttpError(404, 'Registration not found');
    res.json(reg);
  } catch (err) {
    next(err);
  }
}

export async function myRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await Registration.find({ user: req.user!.id })
      .populate({
        path: 'event',
        populate: { path: 'organization', select: 'name slug logoUrl' },
      })
      .sort({ createdAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function eventRegistrations(req: Request, res: Response, next: NextFunction) {
  try {
    const items = await Registration.find({ event: req.params.eventId }).populate(
      'user',
      'name email studentId course',
    );
    res.json({ items });
  } catch (err) {
    next(err);
  }
}
