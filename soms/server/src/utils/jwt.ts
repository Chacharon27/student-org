import jwt, { SignOptions } from 'jsonwebtoken';

export function signToken(payload: { id: string; role: 'admin' | 'student'; email: string }) {
  const options: SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN ?? '7d') as SignOptions['expiresIn'],
  };
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
}
