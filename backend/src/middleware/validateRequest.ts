import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import logger from '../config/logger';

export const validateBody = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Validation error:', { errors: error.issues, path: req.path });
        res.status(400).json({
          error: 'Validation failed',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};

export const validateQuery = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = await schema.parseAsync(req.query);
      req.query = validated as any;
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        logger.warn('Query validation error:', { errors: error.issues, path: req.path });
        res.status(400).json({
          error: 'Invalid query parameters',
          details: error.issues.map((err: any) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
