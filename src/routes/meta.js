import { Router } from 'express';
import { oauthRedirect, oauthCallback, connectionStatus, disconnect } from '../controllers/metaController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/connect', requireAuth, oauthRedirect);
router.get('/callback', oauthCallback);          // no auth — Meta redirects here
router.get('/status', requireAuth, connectionStatus);
router.post('/disconnect', requireAuth, disconnect);

export default router;
