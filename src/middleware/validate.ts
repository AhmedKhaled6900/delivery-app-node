import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiError } from '../utils/ApiError';

export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new ApiError(400, 'Validation failed');
    err.errors = errors.array();
    next(err);
    return;
  }
  next();
}
