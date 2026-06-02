import mongoose from 'mongoose';
import { env } from './env';

function resolveMongoUri(uri: string): string {
  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri)) return uri;
  const [base, query = ''] = uri.split('?');
  const host = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${host}/${env.mongodbDbName}${query ? `?${query}` : ''}`;
}

function printAtlasHelp(message: string): void {
  const isWhitelist =
    message.includes('whitelist') ||
    message.includes('IP that isn') ||
    message.includes('Could not connect to any servers');

  if (!isWhitelist) return;

  console.error('\n--- MongoDB Atlas connection failed ---');
  console.error('Railway uses dynamic IPs — Atlas must allow all IPs:\n');
  console.error('1) Atlas → Network Access → Add IP Address');
  console.error('2) Choose "Allow Access from Anywhere" (0.0.0.0/0)');
  console.error('3) Wait 1–2 minutes, then redeploy\n');
  console.error('Also check Railway Variables:');
  console.error('- MONGODB_URI = same string as local (no quotes)');
  console.error('- Prefer "Standard connection string" (mongodb://...) from Atlas Drivers\n');
}

function printDnsHelp(): void {
  console.error('\n--- MongoDB DNS error (querySrv ECONNREFUSED) ---');
  console.error('Use Atlas "Standard connection string" (mongodb://...) in MONGODB_URI\n');
}

export function isDbConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export async function connectDB(): Promise<void> {
  const uri = resolveMongoUri(env.mongodbUri);
  const maxAttempts = env.nodeEnv === 'production' ? 10 : 3;
  const delayMs = 5_000;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 15_000,
        connectTimeoutMS: 15_000,
      });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      const code = (err as NodeJS.ErrnoException).code;
      const message = err instanceof Error ? err.message : String(err);

      if (code === 'ECONNREFUSED' && message.includes('querySrv')) {
        printDnsHelp();
        throw err;
      }

      printAtlasHelp(message);
      console.error(`MongoDB attempt ${attempt}/${maxAttempts} failed: ${message}`);

      if (attempt === maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
}
