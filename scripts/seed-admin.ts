import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Admin } from '../src/models/Admin';
import { connectDB } from '../src/config/db';

dotenv.config();

async function seed(): Promise<void> {
  await connectDB();

  const phone = process.env.ADMIN_PHONE || '+201000000000';
  const email = process.env.ADMIN_EMAIL || 'admin@delivery.com';

  const exists = await Admin.findOne({ $or: [{ phone }, { email }] });
  if (exists) {
    console.log('Admin already exists:', exists.phone, exists.email);
  } else {
    await Admin.create({
      name: 'Super Admin',
      phone,
      email,
      countryCode: process.env.ADMIN_COUNTRY_CODE || 'EG',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'super_admin',
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
