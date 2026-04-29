import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import {
  deleteUser,
  getUser,
  listUsers,
  updateMe,
  uploadAvatar,
} from '../controllers/user.controller';

const router = Router();

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [Users]
 *     summary: List users (admin)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *       - in: query
 *         name: search
 *         schema: { type: string }
 */
router.get('/', authRequired, requireRole('admin'), listUsers);
router.put('/me', authRequired, updateMe);
router.post('/me/avatar', authRequired, upload.single('file'), uploadAvatar);
router.get('/:id', authRequired, getUser);
router.delete('/:id', authRequired, requireRole('admin'), deleteUser);

export default router;
