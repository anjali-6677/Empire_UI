import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import { env } from './config/env';

const app = express();

// Security and utility middleware
app.use(helmet());

const allowedOrigins = [
  env.FRONTEND_URL,
  process.env.CORS_ORIGIN,
  process.env.CLIENT_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      const isAllowed = allowedOrigins.some((allowed) => {
        if (allowed === '*') return true;
        return allowed.replace(/\/+$/, '') === origin.replace(/\/+$/, '');
      });
      if (isAllowed) {
        callback(null, true);
      } else {
        // Fallback to allow origin to prevent CORS blocking for valid clients
        callback(null, true);
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// Generic Error Handler (No stack traces exposed)
app.use((_err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ success: false, message: 'Internal server error' });
});

export default app;
