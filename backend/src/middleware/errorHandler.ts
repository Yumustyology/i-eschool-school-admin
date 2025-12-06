import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction): void => {
  logger.error('Server error:', { error: err.message, stack: err.stack, path: req.path });
  
  res.status(500).json({
    error: err.message || 'Internal Server Error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

export const notFoundHandler = (req: Request, res: Response): void => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
};
