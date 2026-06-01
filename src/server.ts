import app from './app';
import { connectDB } from './config/db';
import { env } from './config/env';
import { seedDevAdminIfNeeded } from './config/seedDevAdmin';

async function start(): Promise<void> {
  if (env.nodeEnv === 'production') {
    app.set('trust proxy', 1);
  }

  // Listen immediately so Railway health checks get a response while DB connects
  app.listen(env.port, '0.0.0.0', () => {
    console.log(`Listening on 0.0.0.0:${env.port}`);
    console.log(`Health: http://0.0.0.0:${env.port}/api/health`);
  });

  try {
    await connectDB();
    await seedDevAdminIfNeeded();
    console.log('Application ready');
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err instanceof Error ? err.message : err);
    process.exit(1);
  }
}

start().catch((err: Error) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});
