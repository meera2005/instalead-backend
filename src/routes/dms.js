import { Router } from 'express';
import { sync, listConversations, getThread, patchStatus, reply } from '../controllers/dmController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/sync', requireAuth, sync);
router.get('/', requireAuth, listConversations);
router.get('/:id', requireAuth, getThread);
router.patch('/:id/status', requireAuth, patchStatus);
router.post('/:id/reply', requireAuth, reply);

export default router;
