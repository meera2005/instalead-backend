import { Router } from 'express';
import { verify, receive } from '../controllers/webhookController.js';

const router = Router();

// Meta sends GET to verify, POST for events
router.get('/', verify);
router.post('/', receive);

export default router;
