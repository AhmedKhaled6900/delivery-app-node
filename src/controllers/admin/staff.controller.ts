import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import { asyncHandler } from '../../utils/asyncHandler';
import { ApiError } from '../../utils/ApiError';
import { Admin } from '../../models/Admin';
import { DashboardRole } from '../../models/DashboardRole';
import { normalizeEmail, normalizePhone } from '../../utils/phone';
import { toAdminProfile } from '../../services/permission.service';

async function validateRoleIds(roleIds: string[]): Promise<Types.ObjectId[]> {
  const ids = roleIds.map((id) => new Types.ObjectId(id));
  const count = await DashboardRole.countDocuments({ _id: { $in: ids } });
  if (count !== ids.length) {
    throw new ApiError(400, 'One or more role IDs are invalid');
  }
  return ids;
}

export const listStaff = asyncHandler(async (req: Request, res: Response) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const skip = (page - 1) * limit;

  const [staff, total] = await Promise.all([
    Admin.find({ role: { $in: ['staff', 'admin'] } })
      .select('-password')
      .populate('assignedRoles')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Admin.countDocuments({ role: { $in: ['staff', 'admin'] } }),
  ]);

  res.json({
    success: true,
    data: {
      items: staff.map((s) => toAdminProfile(s)),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    },
  });
});

export const getStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await Admin.findOne({
    _id: req.params.id,
    role: { $in: ['staff', 'admin'] },
  })
    .select('-password')
    .populate('assignedRoles');

  if (!staff) throw new ApiError(404, 'Staff member not found');
  res.json({ success: true, data: toAdminProfile(staff) });
});

export const createStaff = asyncHandler(async (req: Request, res: Response) => {
  const phone = normalizePhone(req.body.phone, req.body.countryCode);
  const email = req.body.email ? normalizeEmail(req.body.email) : undefined;
  const assignedRoles = await validateRoleIds(req.body.roleIds);

  const duplicate = await Admin.findOne({
    $or: [{ phone }, ...(email ? [{ email }] : [])],
  });
  if (duplicate) throw new ApiError(409, 'Phone or email already in use');

  const staff = await Admin.create({
    name: req.body.name.trim(),
    phone,
    email,
    countryCode: req.body.countryCode?.toUpperCase(),
    password: req.body.password,
    role: 'staff',
    assignedRoles,
    isActive: true,
    phoneVerified: true,
    emailVerified: Boolean(email),
    createdBy: req.user!._id,
  });

  await staff.populate('assignedRoles');
  res.status(201).json({ success: true, data: toAdminProfile(staff) });
});

export const updateStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await Admin.findOne({
    _id: req.params.id,
    role: { $in: ['staff', 'admin'] },
  });

  if (!staff) throw new ApiError(404, 'Staff member not found');

  if (req.body.name) staff.name = req.body.name.trim();

  if (req.body.phone) {
    const phone = normalizePhone(req.body.phone, req.body.countryCode ?? staff.countryCode);
    const taken = await Admin.findOne({ phone, _id: { $ne: staff._id } });
    if (taken) throw new ApiError(409, 'Phone already in use');
    staff.phone = phone;
  }

  if (req.body.email !== undefined) {
    if (req.body.email === null || req.body.email === '') {
      staff.email = undefined;
    } else {
      const email = normalizeEmail(req.body.email);
      const taken = await Admin.findOne({ email, _id: { $ne: staff._id } });
      if (taken) throw new ApiError(409, 'Email already in use');
      staff.email = email;
    }
  }

  if (req.body.countryCode) {
    staff.countryCode = req.body.countryCode.toUpperCase();
  }

  if (req.body.password) {
    staff.password = req.body.password;
  }

  if (req.body.roleIds) {
    staff.assignedRoles = await validateRoleIds(req.body.roleIds);
    if (staff.role === 'admin') staff.role = 'staff';
  }

  if (req.body.isActive !== undefined) {
    staff.isActive = req.body.isActive;
  }

  await staff.save();
  await staff.populate('assignedRoles');
  res.json({ success: true, data: toAdminProfile(staff) });
});

export const deleteStaff = asyncHandler(async (req: Request, res: Response) => {
  const staff = await Admin.findOne({
    _id: req.params.id,
    role: { $in: ['staff', 'admin'] },
  });

  if (!staff) throw new ApiError(404, 'Staff member not found');

  staff.isActive = false;
  await staff.save();

  res.json({ success: true, message: 'Staff member deactivated' });
});
