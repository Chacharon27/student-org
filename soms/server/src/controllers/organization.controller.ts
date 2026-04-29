import { Request, Response, NextFunction } from 'express';
import { Organization } from '../models/Organization';
import { Member } from '../models/Member';
import { HttpError } from '../middleware/error';
import { slugify } from '../utils/slug';

export async function listOrgs(req: Request, res: Response, next: NextFunction) {
  try {
    const { page = 1, limit = 10, search } = req.query as any;
    const filter: any = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
      ];
    }
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      Organization.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'name email'),
      Organization.countDocuments(filter),
    ]);
    res.json({ items, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
}

export async function getOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await Organization.findById(req.params.id).populate(
      'createdBy',
      'name email',
    );
    if (!org) throw new HttpError(404, 'Organization not found');
    res.json(org);
  } catch (err) {
    next(err);
  }
}

export async function createOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const slugBase = slugify(req.body.name);
    let slug = slugBase;
    let i = 1;
    while (await Organization.exists({ slug })) slug = `${slugBase}-${++i}`;
    const logoUrl = req.file ? `/uploads/${req.file.filename}` : undefined;
    const org = await Organization.create({
      ...req.body,
      slug,
      logoUrl,
      createdBy: req.user!.id,
    });
    res.status(201).json(org);
  } catch (err) {
    next(err);
  }
}

export async function updateOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const update: any = { ...req.body };
    if (req.file) update.logoUrl = `/uploads/${req.file.filename}`;
    const org = await Organization.findByIdAndUpdate(req.params.id, update, {
      new: true,
    });
    if (!org) throw new HttpError(404, 'Organization not found');
    res.json(org);
  } catch (err) {
    next(err);
  }
}

export async function deleteOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const org = await Organization.findByIdAndDelete(req.params.id);
    if (!org) throw new HttpError(404, 'Organization not found');
    await Member.deleteMany({ organization: org._id });
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
}
