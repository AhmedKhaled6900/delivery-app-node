import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Admin } from '../../models/Admin';
import type { IAdminDocument } from '../../models/Admin';
import { toAuthResponse } from '../../services/auth.service';
import { toAdminProfile } from '../../services/permission.service';
import { createAndSendOtp, verifyOtp } from '../../services/otp.service';
import { normalizeEmail, normalizePhone } from '../../utils/phone';
import type { OtpChannel } from '../../types';

async function buildAdminAuthResponse(admin: IAdminDocument) {
  await admin.populate('assignedRoles');
  const auth = toAuthResponse(admin, 'admin');
  auth.user = toAdminProfile(admin);
  return auth;
}

export const loginPhone = asyncHandler(async (req: Request, res: Response) => {
  const phone = normalizePhone(req.body.phone, req.body.countryCode);
  const admin = await Admin.findOne({ phone }).select('+password');
  if (!admin) throw new ApiError(401, 'Invalid phone or password');

  const valid = await admin.comparePassword(req.body.password);
  if (!valid) throw new ApiError(401, 'Invalid phone or password');
  if (!admin.isActive) throw new ApiError(403, 'Account is deactivated');

  res.json({ success: true, data: await buildAdminAuthResponse(admin) });
});

export const loginEmail = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const admin = await Admin.findOne({ email }).select('+password');
  if (!admin) throw new ApiError(401, 'Invalid email or password');

  const valid = await admin.comparePassword(req.body.password);
  if (!valid) throw new ApiError(401, 'Invalid email or password');
  if (!admin.isActive) throw new ApiError(403, 'Account is deactivated');

  res.json({ success: true, data: await buildAdminAuthResponse(admin) });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const channel = req.body.channel as OtpChannel;
  let admin;

  if (channel === 'phone') {
    const phone = normalizePhone(req.body.phone, req.body.countryCode);
    admin = await Admin.findOne({ phone });
    if (!admin) throw new ApiError(404, 'No admin account with this phone');
    await createAndSendOtp({
      role: 'admin',
      userId: admin._id,
      channel: 'phone',
      target: phone,
      purpose: 'admin_reset_password',
    });
  } else {
    const email = normalizeEmail(req.body.email);
    admin = await Admin.findOne({ email });
    if (!admin) throw new ApiError(404, 'No admin account with this email');
    await createAndSendOtp({
      role: 'admin',
      userId: admin._id,
      channel: 'email',
      target: email,
      purpose: 'admin_reset_password',
    });
  }

  res.json({
    success: true,
    message: `OTP sent via ${channel}`,
    data: { channel },
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const channel = req.body.channel as OtpChannel;
  let admin;

  if (channel === 'phone') {
    const phone = normalizePhone(req.body.phone, req.body.countryCode);
    admin = await Admin.findOne({ phone });
    if (!admin) throw new ApiError(404, 'Account not found');
    await verifyOtp({
      role: 'admin',
      userId: admin._id,
      channel: 'phone',
      purpose: 'admin_reset_password',
      code: req.body.code,
    });
  } else {
    const email = normalizeEmail(req.body.email);
    admin = await Admin.findOne({ email });
    if (!admin) throw new ApiError(404, 'Account not found');
    await verifyOtp({
      role: 'admin',
      userId: admin._id,
      channel: 'email',
      purpose: 'admin_reset_password',
      code: req.body.code,
    });
  }

  admin.password = req.body.password;
  if (channel === 'phone') admin.phoneVerified = true;
  else admin.emailVerified = true;
  await admin.save();

  res.json({
    success: true,
    message: 'Password updated successfully',
    data: await buildAdminAuthResponse(admin),
  });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const admin = req.user as IAdminDocument;
  res.json({ success: true, data: { user: toAdminProfile(admin) } });
});
