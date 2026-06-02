import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { PERMISSION_META } from '../../config/permissions';

export const listPermissions = asyncHandler(async (_req: Request, res: Response) => {
  res.json({ success: true, data: PERMISSION_META });
});
