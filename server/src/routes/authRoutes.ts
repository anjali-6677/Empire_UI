import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { loginController, meController, logoutController } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Basic login rate limiting: max 10 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/login', loginLimiter, loginController);
router.get('/me', authenticateToken, meController);
router.post('/logout', logoutController);

export default router;
