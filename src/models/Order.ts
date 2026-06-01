import mongoose, { Schema, type HydratedDocument, type Model, Types } from 'mongoose';
import type { IAddress, OrderStatus } from '../types';

export interface IOrder {
  client: Types.ObjectId;
  delivery?: Types.ObjectId;
  status: OrderStatus;
  pickupAddress: IAddress;
  dropoffAddress: IAddress;
  totalAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type IOrderDocument = HydratedDocument<IOrder>;

type OrderModel = Model<IOrder>;

const orderSchema = new Schema<IOrder, OrderModel>(
  {
    client: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    delivery: { type: Schema.Types.ObjectId, ref: 'Delivery' },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'] as OrderStatus[],
      default: 'pending',
    },
    pickupAddress: {
      street: String,
      city: String,
      coordinates: { lat: Number, lng: Number },
    },
    dropoffAddress: {
      street: String,
      city: String,
      coordinates: { lat: Number, lng: Number },
    },
    totalAmount: { type: Number, default: 0 },
    notes: String,
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder, OrderModel>('Order', orderSchema);
export default Order;
