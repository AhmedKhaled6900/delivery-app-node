import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { Client } from '../../models/Client';
import { registerUser, loginUser, type AuthModel } from '../../services/auth.service';

const ClientAuth = Client as unknown as AuthModel;
import type { RegisterInput, LoginInput } from '../../types';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, token } = await registerUser(ClientAuth, req.body as RegisterInput, 'client');
  res.status(201).json({ success: true, data: { user, token } });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const { user, token } = await loginUser(ClientAuth, email, password, 'client');
  res.json({ success: true, data: { user, token } });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});
