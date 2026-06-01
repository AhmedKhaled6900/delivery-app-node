import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Model, Types } from 'mongoose';
import { ApiError } from '../utils/ApiError';
import { env } from '../config/env';
import type { Role, RegisterInput } from '../types';

export interface AuthUser {
  _id: Types.ObjectId;
  email: string;
  comparePassword(candidate: string): Promise<boolean>;
  toObject(): Record<string, unknown>;
}

export type AuthModel = Model<AuthUser>;

function stripPassword(doc: AuthUser): Record<string, unknown> {
  const obj = doc.toObject();
  delete obj.password;
  return obj;
}

export function signToken(userId: Types.ObjectId, role: Role): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions['expiresIn'],
  };
  return jwt.sign({ id: userId.toString(), role }, env.jwt.secret, options);
}

export async function registerUser(
  Model: AuthModel,
  data: RegisterInput,
  role: Role
): Promise<{ user: Record<string, unknown>; token: string }> {
  const exists = await Model.findOne({ email: data.email });
  if (exists) {
    throw new ApiError(409, 'Email already registered');
  }

  const user = await Model.create(data);
  const token = signToken(user._id, role);

  return { user: stripPassword(user), token };
}

export async function loginUser(
  Model: AuthModel,
  email: string,
  password: string,
  role: Role
): Promise<{ user: Record<string, unknown>; token: string }> {
  const user = await Model.findOne({ email }).select('+password');
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken(user._id, role);
  return { user: stripPassword(user), token };
}
