import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') =>
  (req: Request, _res: Response, next: NextFunction) => {
    if (source === 'body' && req.body && typeof req.body === 'object') {
      req.body = Object.fromEntries(
        Object.entries(req.body).map(([key, value]) => [key.trim(), value]),
      );
    }
    const result = schema.safeParse(req[source]);
    if (!result.success) return next(result.error);
    (req as any)[source] = result.data;
    next();
  };
