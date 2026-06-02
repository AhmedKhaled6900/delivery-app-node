import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { ApiError } from '../utils/ApiError';
import { isDbConnected } from '../config/db';

export function requireDb(): RequestHandler {
  return (_req: Request, _res: Response, next: NextFunction) => {
    if (!isDbConnected()) {
      return next(new ApiError(503, 'Database is not connected. Try again shortly.'));
    }
    next();
  };
}
