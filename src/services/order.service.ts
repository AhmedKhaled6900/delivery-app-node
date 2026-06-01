import type { PopulateOptions } from 'mongoose';
import { Order, type IOrderDocument } from '../models/Order';
import { Delivery } from '../models/Delivery';
import { ApiError } from '../utils/ApiError';
import type { IDeliveryDocument } from '../models/Delivery';
import type { DeliveryStatusUpdate, OrderStatus } from '../types';

export const ORDER_POPULATE: PopulateOptions[] = [
  { path: 'client', select: 'name email phone' },
  { path: 'delivery', select: 'name phone vehicleType' },
];

const DELIVERY_TRANSITIONS: Partial<Record<OrderStatus, DeliveryStatusUpdate[]>> = {
  assigned: ['picked_up'],
  picked_up: ['delivered'],
};

export async function getOrderById(orderId: string): Promise<IOrderDocument> {
  const order = await Order.findById(orderId).populate(ORDER_POPULATE);
  if (!order) throw new ApiError(404, 'Order not found');
  return order;
}

export async function acceptOrder(
  orderId: string,
  deliveryUser: IDeliveryDocument
): Promise<IOrderDocument> {
  if (!deliveryUser.isAvailable) {
    throw new ApiError(400, 'You must be available to accept orders');
  }

  const order = await Order.findOneAndUpdate(
    { _id: orderId, status: 'pending', delivery: null },
    { status: 'assigned', delivery: deliveryUser._id },
    { new: true }
  ).populate(ORDER_POPULATE);

  if (!order) {
    throw new ApiError(400, 'Order is no longer available');
  }

  return order;
}

export async function updateDeliveryStatus(
  orderId: string,
  deliveryId: string,
  newStatus: DeliveryStatusUpdate
): Promise<IOrderDocument> {
  const order = await Order.findById(orderId);
  if (!order) throw new ApiError(404, 'Order not found');

  if (!order.delivery || order.delivery.toString() !== deliveryId.toString()) {
    throw new ApiError(403, 'This order is not assigned to you');
  }

  const allowed = DELIVERY_TRANSITIONS[order.status];
  if (!allowed?.includes(newStatus)) {
    throw new ApiError(400, `Cannot change status from ${order.status} to ${newStatus}`);
  }

  order.status = newStatus;
  await order.save();
  return order.populate(ORDER_POPULATE);
}

export async function assignOrderByAdmin(
  orderId: string,
  deliveryId: string
): Promise<IOrderDocument> {
  const delivery = await Delivery.findById(deliveryId);
  if (!delivery) throw new ApiError(404, 'Delivery driver not found');
  if (!delivery.isActive) throw new ApiError(400, 'Delivery driver is deactivated');

  const order = await Order.findOne({ _id: orderId, status: 'pending', delivery: null });
  if (!order) throw new ApiError(400, 'Only pending unassigned orders can be assigned');

  order.status = 'assigned';
  order.delivery = delivery._id;
  await order.save();
  return order.populate(ORDER_POPULATE);
}

export async function cancelOrder(
  order: IOrderDocument,
  options: { allowAssigned?: boolean } = {}
): Promise<IOrderDocument> {
  const { allowAssigned = false } = options;
  const cancellable: OrderStatus[] = allowAssigned ? ['pending', 'assigned'] : ['pending'];

  if (!cancellable.includes(order.status)) {
    throw new ApiError(400, `Cannot cancel order with status: ${order.status}`);
  }

  order.status = 'cancelled';
  await order.save();
  return order.populate(ORDER_POPULATE);
}
