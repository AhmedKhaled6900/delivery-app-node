import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Admin } from '../src/models/Admin';
import { env } from '../src/config/env';
import type { AdminRole } from '../src/types';

dotenv.config();

const adminData = {
  name: 'Super Admin',
  email: 'admin@delivery.com',
  password: 'admin123',
  role: 'super_admin' as AdminRole,
};

async function seed(): Promise<void> {
  await mongoose.connect(env.mongodbUri);

  const exists = await Admin.findOne({ email: adminData.email });
  if (exists) {
    console.log('Admin already exists:', adminData.email);
    process.exit(0);
  }

  await Admin.create(adminData);
  console.log('Admin created:', adminData.email, '| password:', adminData.password);
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
