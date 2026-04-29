import 'express';

declare global {
  namespace Express {
    interface UserPayload {
      id: string;
      role: 'admin' | 'student';
      email: string;
    }
    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
