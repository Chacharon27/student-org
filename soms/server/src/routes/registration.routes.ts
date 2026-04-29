import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth';
import {
  cancelRegistration,
  eventRegistrations,
  myRegistrations,
  registerForEvent,
} from '../controllers/registration.controller';

const router = Router();

/**
 * @openapi
 * /api/registrations/me:
 *   get:
 *     tags: [Registrations]
 *     summary: List my event registrations
 */
router.get('/me', authRequired, myRegistrations);
router.post('/events/:eventId', authRequired, registerForEvent);
router.delete('/events/:eventId', authRequired, cancelRegistration);
router.get(
  '/events/:eventId',
  authRequired,
  requireRole('admin'),
  eventRegistrations,
);

export default router;
