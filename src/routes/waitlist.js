import { Router } from 'express';
import { submitDemoRequest, listDemoRequests } from '../controllers/waitlistController.js';
import requireAuth from '../middleware/auth.js';

const router = Router();

router.post('/', submitDemoRequest);
router.get('/', requireAuth, listDemoRequests);

export default router;
