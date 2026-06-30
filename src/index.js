import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import metaRoutes from './routes/meta.js';
import dmRoutes from './routes/dms.js';
import webhookRoutes from './routes/webhook.js';
import aiRoutes from './routes/ai.js';
import waitlistRoutes from './routes/waitlist.js';

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  /\.vercel\.app$/,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    const allowed = allowedOrigins.some(o =>
      o instanceof RegExp ? o.test(origin) : o === origin
    );
    cb(allowed ? null : new Error('Not allowed by CORS'), allowed);
  },
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
app.use('/api/waitlist', waitlistRoutes);

app.listen(PORT, () => {
  console.log(`🚀 InstaLead backend running on port ${PORT}`);
});
