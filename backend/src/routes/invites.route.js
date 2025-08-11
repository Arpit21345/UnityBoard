import { Router } from 'express';
import auth from '../middleware/auth.js';
import { createInvite, listInvites, toggleInvite, acceptByCode, acceptByToken } from '../controllers/invitation.controller.js';
import { joinPublicProject } from '../controllers/project.controller.js';

const router = Router();

// Public projects listing is handled separately in explore route (no auth)

// Project-scoped invite management
router.use('/projects/:id', auth);
router.post('/projects/:id/invites', createInvite);
router.get('/projects/:id/invites', listInvites);

// Toggle invite
router.use('/invites', auth);
router.patch('/invites/:inviteId', toggleInvite);

// Accept invite (auth required to join)
router.use('/invites/accept', auth);
router.post('/invites/accept', acceptByCode);
router.post('/invites/accept/:token', acceptByToken);

// Join a public project directly
router.use('/projects/:id/join', auth);
router.post('/projects/:id/join', joinPublicProject);

export default router;
