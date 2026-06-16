import { Router } from 'express';
import { sync, listConversations, getThread, reply } from '../controllers/dmController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post('/sync', requireAuth, sync);
router.get('/', requireAuth, listConversations);
router.get('/:id', requireAuth, getThread);
router.post('/:id/reply', requireAuth, reply);

export default router;
