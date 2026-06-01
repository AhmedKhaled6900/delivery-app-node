import mongoose, { Schema, type HydratedDocument, type Model } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { AdminRole } from '../types';

export interface IAdmin {
  name: string;
  email: string;
  password: string;
  role: AdminRole;
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
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['super_admin', 'admin'] as AdminRole[], default: 'admin' },
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
