import { Request, Response, NextFunction } from 'express';
import { AuthService, UserPayload } from '../services/authService';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication token required',
    });
  }

  const user = AuthService.verifyToken(token);
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
    });
  }

  req.user = user;
  next();
};
