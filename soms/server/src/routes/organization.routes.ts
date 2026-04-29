import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { orgSchema } from '../validators/schemas';
import {
  createOrg,
  deleteOrg,
  getOrg,
  listOrgs,
  updateOrg,
} from '../controllers/organization.controller';

const router = Router();

/**
 * @openapi
 * /api/organizations:
 *   get:
 *     tags: [Organizations]
 *     summary: List organizations
 *     security: []
 */
router.get('/', listOrgs);
router.get('/:id', getOrg);
router.post(
  '/',
  authRequired,
  requireRole('admin'),
  upload.single('logo'),
  validate(orgSchema),
  createOrg,
);
router.put(
  '/:id',
  authRequired,
  requireRole('admin'),
  upload.single('logo'),
  updateOrg,
);
router.delete('/:id', authRequired, requireRole('admin'), deleteOrg);

export default router;
