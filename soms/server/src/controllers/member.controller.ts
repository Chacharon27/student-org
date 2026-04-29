import { Request, Response, NextFunction } from 'express';
import { Member } from '../models/Member';
import { Organization } from '../models/Organization';
import { HttpError } from '../middleware/error';

export async function listMembers(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const items = await Member.find({ organization: orgId })
      .populate('user', 'name email avatarUrl studentId course yearLevel')
      .sort({ joinedAt: -1 });
    res.json({ items });
  } catch (err) {
    next(err);
  }
}

export async function joinOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const exists = await Organization.exists({ _id: orgId });
    if (!exists) throw new HttpError(404, 'Organization not found');
    const dup = await Member.findOne({ user: req.user!.id, organization: orgId });
    if (dup) throw new HttpError(409, 'Already a member or pending');
    const member = await Member.create({
      user: req.user!.id,
      organization: orgId,
      status: 'pending',
      position: 'Member',
    });
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

export async function addMember(req: Request, res: Response, next: NextFunction) {
  try {
    const { orgId } = req.params;
    const { userId, position, status } = req.body;
    const member = await Member.create({
      user: userId,
      organization: orgId,
      position,
      status: status ?? 'active',
    });
    res.status(201).json(member);
  } catch (err) {
    next(err);
  }
}

export async function updateMember(req: Request, res: Response, next: NextFunction) {
  try {
    const member = await Member.findByIdAndUpdate(req.params.memberId, req.body, {
      new: true,
    });
    if (!member) throw new HttpError(404, 'Member not found');
    res.json(member);
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req: Request, res: Response, next: NextFunction) {
  try {
    await Member.findByIdAndDelete(req.params.memberId);
    res.json({ message: 'Removed' });
  } catch (err) {
    next(err);
  }
}
