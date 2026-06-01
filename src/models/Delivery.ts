import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { VehicleType } from '../types';

export interface IDelivery {
  name: string;
  email: string;
  phone: string;
  password: string;
  vehicleType: VehicleType;
  isActive: boolean;
  isAvailable: boolean;
  currentLocation?: { lat?: number; lng?: number };
  createdAt: Date;
  updatedAt: Date;
}

export interface IDeliveryMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type IDeliveryDocument = HydratedDocument<IDelivery, IDeliveryMethods>;

type DeliveryModel = Model<IDelivery, object, IDeliveryMethods>;

const deliverySchema = new Schema<IDelivery, DeliveryModel, IDeliveryMethods>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    vehicleType: {
      type: String,
      enum: ['motorcycle', 'car', 'bicycle'] as VehicleType[],
      default: 'motorcycle',
    },
    isActive: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: false },
    currentLocation: {
      lat: Number,
      lng: Number,
    },
  },
  { timestamps: true }
);

deliverySchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

deliverySchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const Delivery = mongoose.model<IDelivery, DeliveryModel>('Delivery', deliverySchema);
export default Delivery;
