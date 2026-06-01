import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { seedDevAdminIfNeeded } from './config/seedDevAdmin';

async function start(): Promise<void> {
  await connectDB();
  await seedDevAdminIfNeeded();
  app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port}`);
    console.log(`API base: http://localhost:${env.port}/api`);
  });
}

start().catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
