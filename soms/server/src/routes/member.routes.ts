import { Router } from 'express';
import { authRequired, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { memberSchema } from '../validators/schemas';
import {
  addMember,
  joinOrg,
  listMembers,
  removeMember,
  updateMember,
} from '../controllers/member.controller';

const router = Router();

/**
 * @openapi
 * /api/organizations/{orgId}/members:
 *   get:
 *     tags: [Members]
 *     summary: List members of an organization
 *     security: []
 */
router.get('/:orgId/members', listMembers);
router.post('/:orgId/join', authRequired, joinOrg);
router.post(
  '/:orgId/members',
  authRequired,
  requireRole('admin'),
  validate(memberSchema),
  addMember,
);
router.put(
  '/:orgId/members/:memberId',
  authRequired,
  requireRole('admin'),
  updateMember,
);
router.delete(
  '/:orgId/members/:memberId',
  authRequired,
  requireRole('admin'),
  removeMember,
);

export default router;
