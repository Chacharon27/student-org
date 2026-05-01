import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth';
import { uploadSingle } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { eventSchema } from '../validators/schemas';
import {
  createEvent,
  deleteEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '../controllers/event.controller';

const router = Router();

/**
 * @openapi
 * /api/events:
 *   get:
 *     tags: [Events]
 *     summary: List events with pagination/search/filter
 *     security: []
 */
router.get('/', listEvents);
router.get('/:id', getEvent);
router.post(
  '/',
  authRequired,
  requireRole('admin'),
  uploadSingle('poster'),
  validate(eventSchema),
  createEvent,
);
router.put(
  '/:id',
  authRequired,
  requireRole('admin'),
  uploadSingle('poster'),
  updateEvent,
);
router.delete('/:id', authRequired, requireRole('admin'), deleteEvent);

export default router;
