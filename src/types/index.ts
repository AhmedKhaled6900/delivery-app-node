export type Role = 'client' | 'delivery' | 'admin';

export type OrderStatus = 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';

export type DeliveryStatusUpdate = 'picked_up' | 'delivered';

export type VehicleType = 'motorcycle' | 'car' | 'bicycle';

export type AdminRole = 'super_admin' | 'admin';

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

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType?: VehicleType;
}

export interface LoginInput {
  email: string;
  password: string;
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
