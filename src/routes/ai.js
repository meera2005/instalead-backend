import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { getProfile, upsertProfile, getSuggestedReplies, analyzeConv, simulateChat, getSuggestions, getSuggestionsCount, resolveSuggestion, learnFromMessage, getInsights } from '../controllers/aiController.js';

const router = Router();

router.get('/profile', requireAuth, getProfile);
router.put('/profile', requireAuth, upsertProfile);
router.post('/suggest/:id', requireAuth, getSuggestedReplies);
router.post('/analyze/:id', requireAuth, analyzeConv);
router.post('/chat', requireAuth, simulateChat);
router.get('/suggestions', requireAuth, getSuggestions);
router.get('/suggestions/count', requireAuth, getSuggestionsCount);
router.post('/suggestions/:id/resolve', requireAuth, resolveSuggestion);
router.post('/learn', requireAuth, learnFromMessage);
router.get('/insights', requireAuth, getInsights);

export default router;
