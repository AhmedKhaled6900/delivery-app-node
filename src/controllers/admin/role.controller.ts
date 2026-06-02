import type { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { DashboardRole } from '../../models/DashboardRole';
import { Admin } from '../../models/Admin';
import type { Permission } from '../../config/permissions';

export const listRoles = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    DashboardRole.find().sort({ name: 1 }).skip(skip).limit(limit).lean(),
    DashboardRole.countDocuments(),
  ]);

  res.json({
    success: true,
    data: {
      items,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
    },
  });
});

export const getRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await DashboardRole.findById(req.params.id).lean();
  if (!role) throw new ApiError(404, 'Role not found');
  res.json({ success: true, data: role });
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const exists = await DashboardRole.findOne({ name: req.body.name.trim() });
  if (exists) throw new ApiError(409, 'Role name already exists');

  const role = await DashboardRole.create({
    name: req.body.name.trim(),
    description: req.body.description?.trim(),
    permissions: req.body.permissions as Permission[],
    createdBy: req.user!._id,
  });

  res.status(201).json({ success: true, data: role });
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await DashboardRole.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found');

  if (role.isSystem && req.body.name && req.body.name.trim() !== role.name) {
    throw new ApiError(403, 'System roles cannot be renamed');
  }

  if (req.body.name) {
    const duplicate = await DashboardRole.findOne({
      name: req.body.name.trim(),
      _id: { $ne: role._id },
    });
    if (duplicate) throw new ApiError(409, 'Role name already exists');
    role.name = req.body.name.trim();
  }

  if (req.body.description !== undefined) {
    role.description = req.body.description?.trim();
  }

  if (req.body.permissions) {
    role.permissions = req.body.permissions;
  }

  await role.save();
  res.json({ success: true, data: role });
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await DashboardRole.findById(req.params.id);
  if (!role) throw new ApiError(404, 'Role not found');

  if (role.isSystem) {
    throw new ApiError(403, 'System roles cannot be deleted');
  }

  const inUse = await Admin.countDocuments({ assignedRoles: role._id });
  if (inUse > 0) {
    throw new ApiError(409, `Role is assigned to ${inUse} staff member(s). Remove it from staff first.`);
  }

  await role.deleteOne();
  res.json({ success: true, message: 'Role deleted' });
});
