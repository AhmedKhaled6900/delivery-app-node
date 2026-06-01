import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Order } from '../../models/Order';
import {
  ORDER_POPULATE,
  getOrderById,
  acceptOrder,
  updateDeliveryStatus,
} from '../../services/order.service';
import type { OrderStatus, UpdateOrderStatusInput } from '../../types';
import type { IDeliveryDocument } from '../../models/Delivery';

function getDelivery(req: Request): IDeliveryDocument {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  return req.user as IDeliveryDocument;
}

export const listAvailable = asyncHandler(async (_req: Request, res: Response) => {
  const page = parseInt(String(_req.query.page), 10) || 1;
  const limit = parseInt(String(_req.query.limit), 10) || 20;
  const skip = (page - 1) * limit;
  const filter = { status: 'pending' as const, delivery: null };

  const [orders, total] = await Promise.all([
    Order.find(filter).populate(ORDER_POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const delivery = getDelivery(req);
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = parseInt(String(req.query.limit), 10) || 20;
  const skip = (page - 1) * limit;
  const filter: { delivery: typeof delivery._id; status?: OrderStatus } = { delivery: delivery._id };
  if (req.query.status) filter.status = req.query.status as OrderStatus;

  const [orders, total] = await Promise.all([
    Order.find(filter).populate(ORDER_POPULATE).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const accept = asyncHandler(async (req: Request, res: Response) => {
  const delivery = getDelivery(req);
  const order = await acceptOrder(req.params.id, delivery);
  res.json({ success: true, data: { order } });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const delivery = getDelivery(req);
  const { status } = req.body as UpdateOrderStatusInput;
  const order = await updateDeliveryStatus(req.params.id, delivery._id.toString(), status);
  res.json({ success: true, data: { order } });
});

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const delivery = getDelivery(req);
  const order = await getOrderById(req.params.id);

  const deliveryRef = order.delivery as { _id: { toString(): string } } | undefined;
  const isMine = deliveryRef && deliveryRef._id.toString() === delivery._id.toString();
  const isAvailable = order.status === 'pending' && !order.delivery;

  if (!isMine && !isAvailable) {
    throw new ApiError(403, 'Not your order');
  }
  res.json({ success: true, data: { order } });
});
