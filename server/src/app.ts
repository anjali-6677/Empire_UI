import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './routes/authRoutes';
import { env } from './config/env';

const app = express();

// Security and utility middleware
app.use(helmet());
app.use(
  cors({
    origin: [env.FRONTEND_URL, 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:5173'],
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
