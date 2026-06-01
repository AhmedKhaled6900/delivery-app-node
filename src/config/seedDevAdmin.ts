import { Admin } from '../models/Admin';
import { env } from './env';

const DEV_ADMIN = {
  name: 'Super Admin',
  email: 'admin@delivery.com',
  password: 'admin123',
  role: 'super_admin' as const,
};

/** Seeds default admin when using in-memory DB (separate `seed:admin` won't share that DB). */
export async function seedDevAdminIfNeeded(): Promise<void> {
  if (!env.useMemoryDb) return;

  const exists = await Admin.findOne({ email: DEV_ADMIN.email });
  if (exists) return;

  await Admin.create(DEV_ADMIN);
  console.log(`Dev admin ready → ${DEV_ADMIN.email} / ${DEV_ADMIN.password}`);
}
