import dotenv from 'dotenv';
import { Admin } from '../src/models/Admin';
import { connectDB, disconnectDB } from '../src/config/db';
import type { AdminRole } from '../src/types';

dotenv.config();

const adminData = {
  name: 'Super Admin',
  email: 'admin@delivery.com',
  password: 'admin123',
  role: 'super_admin' as AdminRole,
};

async function seed(): Promise<void> {
  await connectDB();

  const exists = await Admin.findOne({ email: adminData.email });
  if (exists) {
    console.log('Admin already exists:', adminData.email);
    await disconnectDB();
    process.exit(0);
  }

  await Admin.create(adminData);
  console.log('Admin created:', adminData.email, '| password:', adminData.password);
  await disconnectDB();
  process.exit(0);
}

seed().catch(async (err) => {
  console.error(err);
  await disconnectDB().catch(() => undefined);
  process.exit(1);
});
