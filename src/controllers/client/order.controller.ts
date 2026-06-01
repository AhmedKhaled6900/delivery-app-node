import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Order } from '../../models/Order';
import { ORDER_POPULATE, getOrderById, cancelOrder } from '../../services/order.service';
import type { CreateOrderInput, OrderStatus } from '../../types';
import type { IClientDocument } from '../../models/Client';

function getClient(req: Request): IClientDocument {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  return req.user as IClientDocument;
}

export const create = asyncHandler(async (req: Request, res: Response) => {
  const client = getClient(req);
  const body = req.body as CreateOrderInput;

  const order = await Order.create({
    client: client._id,
    pickupAddress: body.pickupAddress,
    dropoffAddress: body.dropoffAddress,
    totalAmount: body.totalAmount ?? 0,
    notes: body.notes,
  });

  await order.populate(ORDER_POPULATE);
  res.status(201).json({ success: true, data: { order } });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const client = getClient(req);
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = parseInt(String(req.query.limit), 10) || 20;
  const skip = (page - 1) * limit;
  const filter: { client: typeof client._id; status?: OrderStatus } = { client: client._id };
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

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const client = getClient(req);
  const order = await getOrderById(req.params.id);
  const clientRef = order.client as { _id: { toString(): string } };
  if (clientRef._id.toString() !== client._id.toString()) {
    throw new ApiError(403, 'Not your order');
  }
  res.json({ success: true, data: { order } });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const client = getClient(req);
  const order = await Order.findOne({ _id: req.params.id, client: client._id });
  if (!order) throw new ApiError(404, 'Order not found');

  const updated = await cancelOrder(order);
  res.json({ success: true, data: { order: updated } });
});
