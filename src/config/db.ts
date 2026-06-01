import mongoose from 'mongoose';
import type { MongoMemoryServer } from 'mongodb-memory-server';
import { env } from './env';

let memoryServer: MongoMemoryServer | null = null;

/** Ensures Atlas/local URI includes a database name when missing from the path. */
export function resolveMongoUri(uri: string): string {
  if (uri === 'memory') return uri;

  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri)) {
    return uri;
  }

  const [base, query = ''] = uri.split('?');
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const qs = query ? `?${query}` : '';

  return `${normalizedBase}/${env.mongodbDbName}${qs}`;
}

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
  console.error('Check MONGODB_URI in your .env file (MongoDB Atlas connection string).');
  console.error('Example:');
  console.error(
    '  MONGODB_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/delivery-app?retryWrites=true&w=majority\n'
  );
}

export async function connectDB(): Promise<void> {
  let uri = resolveMongoUri(env.mongodbUri);

  if (env.useMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri(env.mongodbDbName);
    console.log('Using in-memory MongoDB (dev only — data resets on restart)');
  } else {
    console.log('Connecting to MongoDB from MONGODB_URI…');
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15_000,
      connectTimeoutMS: 15_000,
    });
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
