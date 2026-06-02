import mongoose, { Schema, type HydratedDocument, type Model, type Types } from 'mongoose';
import type { Permission } from '../config/permissions';

export interface IDashboardRole {
  name: string;
  description?: string;
  permissions: Permission[];
  isSystem: boolean;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type IDashboardRoleDocument = HydratedDocument<IDashboardRole>;

type DashboardRoleModel = Model<IDashboardRole>;

const dashboardRoleSchema = new Schema<IDashboardRole, DashboardRoleModel>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    permissions: { type: [String], default: [] },
    isSystem: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export const DashboardRole = mongoose.model<IDashboardRole, DashboardRoleModel>(
  'DashboardRole',
  dashboardRoleSchema
);

export default DashboardRole;
