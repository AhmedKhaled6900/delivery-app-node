import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { Delivery } from '../../models/Delivery';
import { registerUser, loginUser, type AuthModel } from '../../services/auth.service';

const DeliveryAuth = Delivery as unknown as AuthModel;
import type { RegisterInput, LoginInput } from '../../types';
import type { IDeliveryDocument } from '../../models/Delivery';
import { ApiError } from '../../utils/ApiError';

function getDelivery(req: Request): IDeliveryDocument {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  return req.user as IDeliveryDocument;
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await registerUser(DeliveryAuth, req.body as RegisterInput, 'delivery');
  res.status(201).json({ success: true, data: { user, token } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const { user, token } = await loginUser(DeliveryAuth, email, password, 'delivery');
  res.json({ success: true, data: { user, token } });
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
