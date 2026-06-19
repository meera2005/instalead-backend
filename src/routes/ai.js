import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, upsertProfile, getSuggestedReplies, analyzeConv, simulateChat } from '../controllers/aiController.js';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, upsertProfile);
router.post('/suggest/:id', requireAuth, getSuggestedReplies);
router.post('/analyze/:id', requireAuth, analyzeConv);
router.post('/chat', requireAuth, simulateChat);

export default router;
