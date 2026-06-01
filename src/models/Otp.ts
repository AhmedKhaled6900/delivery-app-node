import mongoose, { Schema, type Model } from 'mongoose';
import type { OtpChannel, OtpPurpose, Role } from '../types';

export interface IOtp {
  role: Role;
  userId: mongoose.Types.ObjectId;
  channel: OtpChannel;
  target: string;
  purpose: OtpPurpose;
  codeHash: string;
  attempts: number;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

type OtpModel = Model<IOtp>;

const otpSchema = new Schema<IOtp, OtpModel>(
  {
    role: { type: String, enum: ['client', 'admin'], required: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    channel: { type: String, enum: ['phone', 'email'], required: true },
    target: { type: String, required: true, index: true },
    purpose: {
      type: String,
      enum: ['verify_phone', 'verify_email', 'reset_password', 'admin_reset_password'],
      required: true,
    },
    codeHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true, index: { expires: 0 } },
  },
  { timestamps: true }
);

otpSchema.index({ role: 1, userId: 1, purpose: 1, channel: 1 });

export const Otp = mongoose.model<IOtp, OtpModel>('Otp', otpSchema);
