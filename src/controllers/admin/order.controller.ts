import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Order } from '../../models/Order';
import { getOrderById, assignOrderByAdmin, cancelOrder } from '../../services/order.service';
import type { AssignOrderInput } from '../../types';

export const getOne = asyncHandler(async (req: Request, res: Response) => {
  const order = await getOrderById(req.params.id);
  res.json({ success: true, data: { order } });
});

export const assign = asyncHandler(async (req: Request, res: Response) => {
  const { deliveryId } = req.body as AssignOrderInput;
  const order = await assignOrderByAdmin(req.params.id, deliveryId);
  res.json({ success: true, data: { order } });
});

export const cancel = asyncHandler(async (req: Request, res: Response) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  const updated = await cancelOrder(order, { allowAssigned: true });
  res.json({ success: true, data: { order: updated } });
});
