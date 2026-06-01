import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Client } from '../../models/Client';
import { toAuthResponse, verificationFlags } from '../../services/auth.service';
import { createAndSendOtp, verifyOtp } from '../../services/otp.service';
import { verifyGoogleIdToken } from '../../services/google.service';
import { normalizeEmail, normalizePhone } from '../../utils/phone';
import type { IClientDocument } from '../../models/Client';
import type { OtpChannel } from '../../types';

function getClient(req: Request): IClientDocument {
  if (!req.user) throw new ApiError(401, 'Unauthorized');
  return req.user as IClientDocument;
}

async function sendClientVerificationOtp(
  client: IClientDocument,
  channel: OtpChannel
): Promise<void> {
  if (channel === 'phone') {
    if (!client.phone) throw new ApiError(400, 'No phone on account');
    await createAndSendOtp({
      role: 'client',
      userId: client._id,
      channel: 'phone',
      target: client.phone,
      purpose: 'verify_phone',
    });
    return;
  }

  if (!client.email) throw new ApiError(400, 'No email on account');
  await createAndSendOtp({
    role: 'client',
    userId: client._id,
    channel: 'email',
    target: client.email,
    purpose: 'verify_email',
  });
}

function assertCanLogin(client: IClientDocument): void {
  if (client.authProvider === 'phone' && !client.phoneVerified) {
    throw new ApiError(403, 'Verify your phone number first');
  }
  if (client.authProvider === 'email' && !client.emailVerified) {
    throw new ApiError(403, 'Verify your email first');
  }
}

export const registerEmail = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  if (await Client.findOne({ email })) {
    throw new ApiError(409, 'Email already registered');
  }

  const client = await Client.create({
    name: req.body.name,
    email,
    countryCode: req.body.countryCode?.toUpperCase(),
    password: req.body.password,
    authProvider: 'email',
    emailVerified: false,
  });

  await sendClientVerificationOtp(client, 'email');

  res.status(201).json({
    success: true,
    data: toAuthResponse(client, 'client', { email: true }),
    message: 'OTP sent to your email',
  });
});

export const registerPhone = asyncHandler(async (req: Request, res: Response) => {
  const phone = normalizePhone(req.body.phone, req.body.countryCode);
  if (await Client.findOne({ phone })) {
    throw new ApiError(409, 'Phone already registered');
  }

  const client = await Client.create({
    name: req.body.name,
    phone,
    countryCode: req.body.countryCode?.toUpperCase(),
    password: req.body.password,
    authProvider: 'phone',
    phoneVerified: false,
  });

  await sendClientVerificationOtp(client, 'phone');

  res.status(201).json({
    success: true,
    data: toAuthResponse(client, 'client', { phone: true }),
    message: 'OTP sent to your phone',
  });
});

export const registerGoogle = asyncHandler(async (req: Request, res: Response) => {
  const googleUser = await verifyGoogleIdToken(req.body.idToken);

  let client = await Client.findOne({
    $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
  });

  if (!client) {
    client = await Client.create({
      name: req.body.name || googleUser.name,
      email: googleUser.email,
      googleId: googleUser.googleId,
      authProvider: 'google',
      emailVerified: googleUser.emailVerified,
      countryCode: req.body.countryCode?.toUpperCase(),
    });
  } else {
    if (!client.googleId) client.googleId = googleUser.googleId;
    if (googleUser.emailVerified) client.emailVerified = true;
    await client.save();
  }

  res.status(201).json({
    success: true,
    data: toAuthResponse(client, 'client', verificationFlags(client)),
  });
});

export const loginEmail = asyncHandler(async (req: Request, res: Response) => {
  const email = normalizeEmail(req.body.email);
  const client = await Client.findOne({ email }).select('+password');
  if (!client) throw new ApiError(401, 'Invalid email or password');

  const valid = await client.comparePassword(req.body.password);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  assertCanLogin(client);
  res.json({ success: true, data: toAuthResponse(client, 'client') });
});

export const loginPhone = asyncHandler(async (req: Request, res: Response) => {
  const phone = normalizePhone(req.body.phone, req.body.countryCode);
  const client = await Client.findOne({ phone }).select('+password');
  if (!client) throw new ApiError(401, 'Invalid phone or password');

  const valid = await client.comparePassword(req.body.password);
  if (!valid) throw new ApiError(401, 'Invalid phone or password');

  assertCanLogin(client);
  res.json({ success: true, data: toAuthResponse(client, 'client') });
});

export const loginGoogle = asyncHandler(async (req: Request, res: Response) => {
  const googleUser = await verifyGoogleIdToken(req.body.idToken);

  const client = await Client.findOne({
    $or: [{ googleId: googleUser.googleId }, { email: googleUser.email }],
  });

  if (!client) {
    throw new ApiError(404, 'Account not found. Please register with Google first');
  }

  if (!client.googleId) {
    client.googleId = googleUser.googleId;
    await client.save();
  }

  res.json({ success: true, data: toAuthResponse(client, 'client') });
});

export const verifyOtpCode = asyncHandler(async (req: Request, res: Response) => {
  const client = getClient(req);
  const channel = req.body.channel as OtpChannel;

  const purpose = channel === 'phone' ? 'verify_phone' : 'verify_email';
  await verifyOtp({
    role: 'client',
    userId: client._id,
    channel,
    purpose,
    code: req.body.code,
  });

  if (channel === 'phone') client.phoneVerified = true;
  else client.emailVerified = true;
  await client.save();

  res.json({
    success: true,
    message: `${channel} verified successfully`,
    data: toAuthResponse(client, 'client'),
  });
});

export const resendOtp = asyncHandler(async (req: Request, res: Response) => {
  const client = getClient(req);
  const channel = req.body.channel as OtpChannel;

  if (channel === 'phone' && client.phoneVerified) {
    throw new ApiError(400, 'Phone already verified');
  }
  if (channel === 'email' && client.emailVerified) {
    throw new ApiError(400, 'Email already verified');
  }

  await sendClientVerificationOtp(client, channel);

  res.json({ success: true, message: `OTP resent via ${channel}` });
});

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  res.json({ success: true, data: { user: req.user } });
});
