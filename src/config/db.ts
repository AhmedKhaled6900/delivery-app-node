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

function getClusterHost(uri: string): string {
  const match = uri.match(/@([^/?]+)/);
  return match?.[1] ?? 'unknown';
}

function printMongoHelp(uri: string, err?: unknown): void {
  const message = err instanceof Error ? err.message : String(err);
  const host = getClusterHost(uri);

  console.error('\n--- MongoDB connection failed ---');
  console.error(`Cluster host: ${host}`);

  console.error('\nIf Network Access already has 0.0.0.0/0 (Active), the cause is usually:');
  console.error('  1. Cluster is PAUSED → Atlas → Database → Resume');
  console.error('  2. Wrong MONGODB_URI on Railway (typo, old password, extra quotes)');
  console.error('  3. Database Access user/password does not match the URI');
  console.error('  4. Password has @ # % etc. → URL-encode it in the connection string');
  console.error('  5. Copy a fresh string: Atlas → Database → Connect → Drivers → Node.js');
  console.error('\nRailway Variables: paste URI with NO surrounding quotes. Then Redeploy.\n');

  if (!message.includes('whitelist') && !message.includes('Could not connect')) {
    console.error('Details:', message);
  }
}

async function connectWithRetry(uri: string, attempts = 3): Promise<void> {
  let lastError: unknown;

  for (let i = 1; i <= attempts; i += 1) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
      });
      return;
    } catch (err) {
      lastError = err;
      await mongoose.disconnect().catch(() => undefined);
      if (i < attempts) {
        console.warn(`MongoDB connect attempt ${i}/${attempts} failed, retrying…`);
        await new Promise((r) => setTimeout(r, 3000));
      }
    }
  }

  throw lastError;
}

export async function connectDB(): Promise<void> {
  let uri = resolveMongoUri(env.mongodbUri);

  if (env.useMemoryDb) {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    memoryServer = await MongoMemoryServer.create();
    uri = memoryServer.getUri(env.mongodbDbName);
    console.log('Using in-memory MongoDB (dev only — data resets on restart)');
  } else {
    console.log(`Connecting to MongoDB (${getClusterHost(uri)})…`);
  }

  try {
    await connectWithRetry(uri);
    console.log('MongoDB connected');
  } catch (err) {
    printMongoHelp(uri, err);
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
