import type { Request, Response, NextFunction, RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { Client } from '../models/Client';
import { Delivery } from '../models/Delivery';
import { Admin } from '../models/Admin';
import type { Role, JwtPayload } from '../types';
import type { IClientDocument } from '../models/Client';
import type { IDeliveryDocument } from '../models/Delivery';
import type { IAdminDocument } from '../models/Admin';

type RoleDocumentMap = {
  client: IClientDocument;
  delivery: IDeliveryDocument;
  admin: IAdminDocument;
};

async function findUserByRole(
  role: Role,
  id: string
): Promise<IClientDocument | IDeliveryDocument | IAdminDocument | null> {
  switch (role) {
    case 'client':
      return Client.findById(id).select('-password') as Promise<IClientDocument | null>;
    case 'delivery':
      return Delivery.findById(id).select('-password') as Promise<IDeliveryDocument | null>;
    case 'admin':
      return Admin.findById(id)
        .select('-password')
        .populate('assignedRoles') as Promise<IAdminDocument | null>;
  }
}

export function authenticate<R extends Role>(role: R): RequestHandler {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      return next(new ApiError(401, 'Access token required'));
    }

    const token = header.split(' ')[1];

    try {
      const decoded = jwt.verify(token, env.jwt.secret) as JwtPayload;

      if (decoded.role !== role) {
        return next(new ApiError(403, 'Invalid token for this resource'));
      }

      const user = await findUserByRole(role, decoded.id);
      if (!user) {
        return next(new ApiError(401, 'User not found'));
      }

      if (role === 'delivery' && !(user as IDeliveryDocument).isActive) {
        return next(new ApiError(403, 'Delivery account is deactivated'));
      }

      if (role === 'admin' && !(user as IAdminDocument).isActive) {
        return next(new ApiError(403, 'Admin account is deactivated'));
      }

      req.user = user as RoleDocumentMap[R];
      next();
    } catch {
      next(new ApiError(401, 'Invalid or expired token'));
    }
  };
}

export const clientAuth = authenticate('client');
export const deliveryAuth = authenticate('delivery');
export const adminAuth = authenticate('admin');
