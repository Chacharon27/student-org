import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { signToken } from '../utils/jwt';
import { HttpError } from '../middleware/error';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const exists = await User.findOne({ email });
    if (exists) throw new HttpError(409, 'Email already registered');
    const user = await User.create(req.body);
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw new HttpError(401, 'Invalid credentials');
    const ok = await user.comparePassword(password);
    if (!ok) throw new HttpError(401, 'Invalid credentials');
    const token = signToken({ id: user.id, role: user.role, email: user.email });
    res.json({ token, user });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) throw new HttpError(404, 'User not found');
    res.json(user);
  } catch (err) {
    next(err);
  }
}
