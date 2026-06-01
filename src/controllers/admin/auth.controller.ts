import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { Admin } from '../../models/Admin';
import { loginUser, type AuthModel } from '../../services/auth.service';

const AdminAuth = Admin as unknown as AuthModel;
import type { LoginInput } from '../../types';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as LoginInput;
  const { user, token } = await loginUser(AdminAuth, email, password, 'admin');
  res.json({ success: true, data: { user, token } });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});
