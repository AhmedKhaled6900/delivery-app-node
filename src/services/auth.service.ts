import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import type { Role, AuthResponse } from '../types';

interface TokenUser {
  _id: Types.ObjectId;
  toObject(): Record<string, unknown>;
  password?: string;
}

export function signToken(userId: Types.ObjectId, role: Role): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign({ id: userId.toString(), role }, env.jwt.secret, options);
}

export function toAuthResponse(
  user: TokenUser,
  role: Role,
  requiresVerification?: AuthResponse['requiresVerification']
): AuthResponse {
  const obj = user.toObject();
  delete obj.password;
  return {
    user: obj,
    token: signToken(user._id, role),
    ...(requiresVerification && Object.keys(requiresVerification).length > 0
      ? { requiresVerification }
      : {}),
  };
}

export function verificationFlags(user: {
  phone?: string;
  email?: string;
  phoneVerified: boolean;
  emailVerified: boolean;
}): AuthResponse['requiresVerification'] {
  const flags: AuthResponse['requiresVerification'] = {};
  if (user.phone && !user.phoneVerified) flags.phone = true;
  if (user.email && !user.emailVerified) flags.email = true;
  return Object.keys(flags).length > 0 ? flags : undefined;
}
