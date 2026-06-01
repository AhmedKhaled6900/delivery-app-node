import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { Otp } from '../models/Otp';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import { sendOtp } from './notify.service';
import type { Types } from 'mongoose';
import type { OtpChannel, OtpPurpose } from '../types';

type OtpRole = 'client' | 'admin';

function generateCode(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function createAndSendOtp(params: {
  role: OtpRole;
  userId: Types.ObjectId;
  channel: OtpChannel;
  target: string;
  purpose: OtpPurpose;
}): Promise<void> {
  const since = new Date(Date.now() - env.otp.resendCooldownSeconds * 1000);
  const recent = await Otp.findOne({
    role: params.role,
    userId: params.userId,
    purpose: params.purpose,
    channel: params.channel,
    createdAt: { $gte: since },
  });

  if (recent) {
    throw new ApiError(
      429,
      `Please wait ${env.otp.resendCooldownSeconds} seconds before requesting a new code`
    );
  }

  await Otp.deleteMany({
    role: params.role,
    userId: params.userId,
    purpose: params.purpose,
    channel: params.channel,
  });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + env.otp.expiresMinutes * 60 * 1000);

  await Otp.create({
    role: params.role,
    userId: params.userId,
    channel: params.channel,
    target: params.target,
    purpose: params.purpose,
    codeHash,
    expiresAt,
  });

  await sendOtp(params.channel, params.target, code, params.purpose);
}

export async function verifyOtp(params: {
  role: OtpRole;
  userId: Types.ObjectId;
  channel: OtpChannel;
  purpose: OtpPurpose;
  code: string;
}): Promise<void> {
  const record = await Otp.findOne({
    role: params.role,
    userId: params.userId,
    purpose: params.purpose,
    channel: params.channel,
  }).select('+codeHash');

  if (!record) {
    throw new ApiError(400, 'Invalid or expired verification code');
  }

  if (record.expiresAt < new Date()) {
    await record.deleteOne();
    throw new ApiError(400, 'Verification code has expired');
  }

  if (record.attempts >= env.otp.maxAttempts) {
    await record.deleteOne();
    throw new ApiError(400, 'Too many attempts. Request a new code');
  }

  const valid = await bcrypt.compare(params.code, record.codeHash);
  if (!valid) {
    record.attempts += 1;
    await record.save();
    throw new ApiError(400, 'Invalid verification code');
  }

  await record.deleteOne();
}
