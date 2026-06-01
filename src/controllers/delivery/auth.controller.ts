import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Delivery } from '../../models/Delivery';
import { toAuthResponse } from '../../services/auth.service';
import { normalizeEmail, normalizePhone } from '../../utils/phone';
import type { IDeliveryDocument } from '../../models/Delivery';

function getDelivery(req: Request): IDeliveryDocument {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  return req.user as IDeliveryDocument;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const phone = normalizePhone(req.body.phone, req.body.countryCode);

  if (await Delivery.findOne({ $or: [{ email }, { phone }] })) {
    throw new ApiError(409, 'Email or phone already registered');
  }

  const delivery = await Delivery.create({
    name: req.body.name,
    email,
    phone,
    password: req.body.password,
    vehicleType: req.body.vehicleType,
  });

  res.status(201).json({ success: true, data: toAuthResponse(delivery, 'delivery') });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const delivery = await Delivery.findOne({ email }).select('+password');
  if (!delivery) throw new ApiError(401, 'Invalid email or password');

  const valid = await delivery.comparePassword(req.body.password);
  if (!valid) throw new ApiError(401, 'Invalid email or password');
  if (!delivery.isActive) throw new ApiError(403, 'Account is deactivated');

  res.json({ success: true, data: toAuthResponse(delivery, 'delivery') });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});

export const toggleAvailability = asyncHandler(async (req: Request, res: Response) => {
  const delivery = getDelivery(req);
  delivery.isAvailable = !delivery.isAvailable;
  await delivery.save();
  res.json({ success: true, data: { isAvailable: delivery.isAvailable } });
});
