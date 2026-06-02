import type { Request, Response, NextFunction, RequestHandler } from 'express';
import type { Permission } from '../config/permissions';
import { ApiError } from '../utils/ApiError';
import { hasAnyPermission, resolvePermissions } from '../services/permission.service';
import type { IAdminDocument } from '../models/Admin';
import type { IDashboardRoleDocument } from '../models/DashboardRole';

declare module 'express-serve-static-core' {
  interface Request {
    adminPermissions?: Permission[];
  }
}

export function loadAdminPermissions(): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    const admin = req.user as IAdminDocument | undefined;
    if (!admin) return next(new ApiError(401, 'Authentication required'));

    const populated = admin.assignedRoles as unknown as IDashboardRoleDocument[];
    req.adminPermissions = resolvePermissions(admin, populated);
    next();
  };
}

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
    if (admin.role !== 'super_admin') {
      return next(new ApiError(403, 'Super admin access required'));
    }
    next();
  };
}
