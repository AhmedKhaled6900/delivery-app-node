export type Role = 'client' | 'delivery' | 'admin';

export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';

export type DeliveryStatusUpdate = 'picked_up' | 'delivered';

export type VehicleType = 'motorcycle' | 'car' | 'bicycle';

export type AdminRole = 'super_admin' | 'staff' | 'admin';

export type OtpChannel = 'phone' | 'email';

export type OtpPurpose =
  | 'verify_phone'
  | 'verify_email'
  | 'reset_password'
  | 'admin_reset_password';

export type ClientAuthProvider = 'phone' | 'email' | 'google';

export interface ICoordinates {
  lat?: number;
  lng?: number;
}

export interface IAddress {
  street: string;
  city: string;
  coordinates?: ICoordinates;
}

export interface IClientAddress extends IAddress {
  label?: string;
}

export interface JwtPayload {
  id: string;
  role: Role;
}

export interface CreateOrderInput {
  pickupAddress: IAddress;
  dropoffAddress: IAddress;
  totalAmount?: number;
  notes?: string;
}

export interface AssignOrderInput {
  deliveryId: string;
}

export interface UpdateOrderStatusInput {
  status: DeliveryStatusUpdate;
}

export interface AuthResponse {
  user: Record<string, unknown>;
  token: string;
  requiresVerification?: {
    phone?: boolean;
    email?: boolean;
  };
}
