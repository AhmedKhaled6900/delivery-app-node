import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let memoryServer: MongoMemoryServer | null = null;

function isConnectionRefused(err: unknown): boolean {
  return (
    err instanceof Error &&
    ('code' in err || 'cause' in err) &&
    ((err as NodeJS.ErrnoException).code === 'ECONNREFUSED' ||
      String((err as { cause?: unknown }).cause).includes('ECONNREFUSED'))
  );
}

function printMongoHelp(): void {
  console.error('\n--- MongoDB connection failed ---');
  console.error(`Tried: ${env.mongodbUri}`);
  console.error('\nQuick fix (no install): set in .env');
  console.error('  MONGODB_URI=memory');
  console.error('\nOr use MongoDB Atlas / local MongoDB:');
  console.error('  MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/delivery-app');
  console.error('  MONGODB_URI=mongodb://localhost:27017/delivery-app\n');
}

export async function connectDB(): Promise<void> {
  let uri = env.mongodbUri;

  if (env.useMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri('delivery-app');
    console.log('Using in-memory MongoDB (dev only — data resets on restart)');
  }

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (err) {
    if (isConnectionRefused(err)) {
      printMongoHelp();
    }
    throw err;
  }
}

export async function disconnectDB(): Promise<void> {
  await mongoose.disconnect();
  if (memoryServer) {
    await memoryServer.stop();
    memoryServer = null;
  }
}
