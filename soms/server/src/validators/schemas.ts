import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(160),
  password: z.string().min(8).max(72),
  studentId: z.string().max(40).optional(),
  course: z.string().max(80).optional(),
  yearLevel: z.coerce.number().int().min(1).max(6).optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const orgSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().min(5).max(2000),
  category: z.string().min(2).max(80),
});

export const memberSchema = z.object({
  userId: z.string().regex(/^[a-f\d]{24}$/i),
  position: z.string().max(80).optional(),
  status: z.enum(['pending', 'active', 'inactive']).optional(),
});

export const eventSchema = z.object({
  title: z.string().min(2).max(160),
  description: z.string().min(5).max(4000),
  organization: z.string().regex(/^[a-f\d]{24}$/i),
  startsAt: z.coerce.date(),
  endsAt: z.coerce.date(),
  location: z.string().min(2).max(200),
  capacity: z.coerce.number().int().min(0).max(100000).optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(2).max(160),
  body: z.string().min(2).max(5000),
  organization: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  pinned: z.coerce.boolean().optional(),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().max(120).optional(),
});
