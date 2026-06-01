import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Client } from '../../models/Client';
import { Delivery } from '../../models/Delivery';
import { Order } from '../../models/Order';
import type { OrderStatus } from '../../types';

export const getStats = asyncHandler(async (_req: Request, res: Response) => {
  const [clientsCount, deliveriesCount, ordersCount, pendingOrders, activeDeliveries] =
    await Promise.all([
      Client.countDocuments(),
      Delivery.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Delivery.countDocuments({ isActive: true, isAvailable: true }),
    ]);

  res.json({
    success: true,
    data: {
      clientsCount,
      deliveriesCount,
      ordersCount,
      pendingOrders,
      activeDeliveries,
    },
  });
});

export const listClients = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = parseInt(String(req.query.limit), 10) || 20;
  const skip = (page - 1) * limit;

  const [clients, total] = await Promise.all([
    Client.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Client.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { clients, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const listDeliveries = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = parseInt(String(req.query.limit), 10) || 20;
  const skip = (page - 1) * limit;

  const [deliveries, total] = await Promise.all([
    Delivery.find().select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Delivery.countDocuments(),
  ]);

  res.json({
    success: true,
    data: { deliveries, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const listOrders = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(String(req.query.page), 10) || 1;
  const limit = parseInt(String(req.query.limit), 10) || 20;
  const skip = (page - 1) * limit;
  const filter = req.query.status ? { status: req.query.status as OrderStatus } : {};

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate('client', 'name email phone')
      .populate('delivery', 'name phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: { orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
  });
});

export const toggleDeliveryStatus = asyncHandler(async (req: Request, res: Response) => {
  const delivery = await Delivery.findById(req.params.id);
  if (!delivery) throw new ApiError(404, 'Delivery driver not found');

  delivery.isActive = !delivery.isActive;
  await delivery.save();

  res.json({ success: true, data: { id: delivery._id, isActive: delivery.isActive } });
});
