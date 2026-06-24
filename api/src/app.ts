import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { generalLimiter } from './middleware/rateLimit.middleware';
import { routes } from './routes';

export const app = express();

const allowedOrigins = [
  env.FRONTEND_URL,
  // Accept Railway-injected public domain (set RAILWAY_PUBLIC_DOMAIN in dashboard)
  ...(process.env.RAILWAY_PUBLIC_DOMAIN ? [`https://${process.env.RAILWAY_PUBLIC_DOMAIN}`] : [])
].filter(Boolean);

app.use(
  helmet({
    // Allow Google Sign-In popup to postMessage back to the opener
    crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
    contentSecurityPolicy: false
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any localhost in development
      if (env.NODE_ENV !== 'production' && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.resolve(env.UPLOAD_DIR)));

// Health check BEFORE rate limiter — Railway polls this frequently
app.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok', env: env.NODE_ENV }, message: null, error: null });
});

app.use(generalLimiter);

app.use('/api/v1', routes);
app.use(errorMiddleware);
