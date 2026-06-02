import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Permission } from '../config/permissions';
import { ALL_PERMISSIONS } from '../config/permissions';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { hasAnyPermission, hasFullAccess, resolvePermissions } from '../services/permission.service';
import type { IAdminDocument } from '../models/Admin';

declare module 'express-serve-static-core' {
  interface Request {
    adminPermissions?: Permission[];
  }
}

export const loadAdminPermissions = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const admin = req.user as IAdminDocument | undefined;
  if (!admin) {
    next(new ApiError(401, 'Authentication required'));
    return;
  }

  if (hasFullAccess(admin)) {
    req.adminPermissions = [...ALL_PERMISSIONS];
    next();
    return;
  }

  if (admin.assignedRoles?.length) {
    await admin.populate('assignedRoles');
  }

  req.adminPermissions = resolvePermissions(admin);
  next();
});

export function requirePermission(...permissions: Permission[]): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const admin = req.user as IAdminDocument;
    if (!admin) return next(new ApiError(401, 'Authentication required'));

    if (!hasAnyPermission(admin, permissions, req.adminPermissions)) {
      return next(new ApiError(403, 'You do not have permission for this action'));
    }
    next();
  };
}

export function requireSuperAdmin(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const admin = req.user as IAdminDocument;
    if (!hasFullAccess(admin)) {
      return next(new ApiError(403, 'Super admin access required'));
    }
    next();
  };
}
