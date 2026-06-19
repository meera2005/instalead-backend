import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import metaRoutes from './routes/meta.js';
import dmRoutes from './routes/dms.js';
import webhookRoutes from './routes/webhook.js';
import aiRoutes from './routes/ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Capture raw body via verify — needed for webhook signature verification
app.use(express.json({
  verify: (req, res, buf) => { req.rawBody = buf.toString(); },
}));

// Health check
app.get('/health', (_, res) => res.json({ ok: true, ts: new Date() }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/meta', metaRoutes);
app.use('/api/dms', dmRoutes);
app.use('/api/webhook', webhookRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
  console.log(`🚀 InstaLead backend running on port ${PORT}`);
});
