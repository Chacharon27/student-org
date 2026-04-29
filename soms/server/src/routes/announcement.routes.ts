import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { announcementSchema } from '../validators/schemas';
import {
  createAnnouncement,
  deleteAnnouncement,
  listAnnouncements,
  updateAnnouncement,
} from '../controllers/announcement.controller';

const router = Router();

/**
 * @openapi
 * /api/announcements:
 *   get:
 *     tags: [Announcements]
 *     summary: List announcements
 *     security: []
 */
router.get('/', listAnnouncements);
router.post(
  '/',
  authRequired,
  requireRole('admin'),
  validate(announcementSchema),
  createAnnouncement,
);
router.put('/:id', authRequired, requireRole('admin'), updateAnnouncement);
router.delete('/:id', authRequired, requireRole('admin'), deleteAnnouncement);

export default router;
