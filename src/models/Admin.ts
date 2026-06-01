import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { AdminRole } from '../types';

export interface IAdmin {
  name: string;
  phone: string;
  email?: string;
  countryCode?: string;
  password: string;
  role: AdminRole;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdminMethods {
  comparePassword(candidate: string): Promise<boolean>;
}

export type IAdminDocument = HydratedDocument<IAdmin, IAdminMethods>;

type AdminModel = Model<IAdmin, object, IAdminMethods>;

const adminSchema = new Schema<IAdmin, AdminModel, IAdminMethods>(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    countryCode: { type: String, uppercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['super_admin', 'admin'] as AdminRole[], default: 'admin' },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password);
};

export const Admin = mongoose.model<IAdmin, AdminModel>('Admin', adminSchema);
export default Admin;
