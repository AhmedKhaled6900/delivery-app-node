import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Admin } from '../src/models/Admin';
import { DashboardRole } from '../src/models/DashboardRole';
import { connectDB } from '../src/config/db';
import type { Permission } from '../src/config/permissions';

dotenv.config();

const DEFAULT_ROLES: Array<{
  name: string;
  description: string;
  permissions: Permission[];
}> = [
  {
    name: 'Viewer',
    description: 'Read-only access to dashboard data',
    permissions: [
      'dashboard.view_stats',
      'clients.view',
      'deliveries.view',
      'orders.view',
    ],
  },
  {
    name: 'Orders Manager',
    description: 'Manage orders and view related data',
    permissions: [
      'dashboard.view_stats',
      'clients.view',
      'deliveries.view',
      'orders.view',
      'orders.assign',
      'orders.cancel',
    ],
  },
  {
    name: 'Operations Manager',
    description: 'Manage deliveries and orders',
    permissions: [
      'dashboard.view_stats',
      'clients.view',
      'deliveries.view',
      'deliveries.manage',
      'orders.view',
      'orders.assign',
      'orders.cancel',
    ],
  },
  {
    name: 'HR Manager',
    description: 'Manage staff and roles',
    permissions: [
      'roles.view',
      'roles.manage',
      'staff.view',
      'staff.manage',
    ],
  },
];

async function seedRoles(): Promise<void> {
  for (const role of DEFAULT_ROLES) {
    const exists = await DashboardRole.findOne({ name: role.name });
    if (exists) continue;
    await DashboardRole.create({ ...role, isSystem: true });
    console.log('Role created:', role.name);
  }
}

async function seed(): Promise<void> {
  await connectDB();
  await seedRoles();

  const phone = process.env.ADMIN_PHONE || '+201000000000';
  const email = process.env.ADMIN_EMAIL || 'admin@delivery.com';

  const exists = await Admin.findOne({ $or: [{ phone }, { email }] });
  if (exists) {
    if (exists.role !== 'super_admin') {
      exists.role = 'super_admin';
      exists.isActive = true;
      await exists.save();
      console.log('Existing admin upgraded to super_admin');
    } else {
      console.log('Admin already exists:', exists.phone, exists.email);
    }
  } else {
    await Admin.create({
      name: 'Super Admin',
      phone,
      email,
      countryCode: process.env.ADMIN_COUNTRY_CODE || 'EG',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin',
      assignedRoles: [],
      isActive: true,
      phoneVerified: true,
      emailVerified: true,
    });
    console.log('Admin created');
    console.log('  phone:', phone, '| password:', process.env.ADMIN_PASSWORD || 'admin123');
    console.log('  email:', email);
  }

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
