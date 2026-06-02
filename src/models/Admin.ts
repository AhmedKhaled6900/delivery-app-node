import mongoose, { Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import type { AdminRole } from '../types';

export interface IAdmin {
  name: string;
  phone: string;
  email?: string;
  countryCode?: string;
  password: string;
  role: AdminRole;
  assignedRoles: Types.ObjectId[];
  isActive: boolean;
  phoneVerified: boolean;
  emailVerified: boolean;
  createdBy?: Types.ObjectId;
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
    role: {
      type: String,
      enum: ['super_admin', 'staff', 'admin'] as AdminRole[],
      default: 'staff',
    },
    assignedRoles: [{ type: Schema.Types.ObjectId, ref: 'DashboardRole' }],
    isActive: { type: Boolean, default: true },
    phoneVerified: { type: Boolean, default: false },
    emailVerified: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
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
