import type { IClientDocument } from '../models/Client';
import type { IDeliveryDocument } from '../models/Delivery';
import type { IAdminDocument } from '../models/Admin';

export type AuthUser = IClientDocument | IDeliveryDocument | IAdminDocument;

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export {};
