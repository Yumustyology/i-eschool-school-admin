import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../config/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        logger.warn('Invalid token attempt', { error: err.message });
        res.status(403).json({ error: 'Invalid or expired token' });
        return;
      }

      (req as any).user = decoded;
      next();
    });
  } catch (error: any) {
    logger.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

export const authorizeRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as any).user;

    if (!user || !roles.includes(user.role)) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
};
