import mongoose from 'mongoose';
import { env } from './env';

function resolveMongoUri(uri: string): string {
  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri)) return uri;
  const [base, query = ''] = uri.split('?');
  const host = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${host}/${env.mongodbDbName}${query ? `?${query}` : ''}`;
}

function printDnsHelp(): void {
  console.error('\n--- MongoDB DNS error (querySrv ECONNREFUSED) ---');
  console.error('Your PC cannot resolve Atlas SRV records. Try one of these:\n');
  console.error('1) Change DNS to 8.8.8.8 or 1.1.1.1 (Windows network settings)');
  console.error('2) Run: ipconfig /flushdns');
  console.error('3) Atlas → Connect → Drivers → copy "Standard connection string"');
  console.error('   Use mongodb://... (NOT mongodb+srv://) in MONGODB_URI\n');
  console.error('4) Disable VPN / try another network (mobile hotspot)\n');
}

export async function connectDB(): Promise<void> {
  const uri = resolveMongoUri(env.mongodbUri);

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20_000,
      connectTimeoutMS: 20_000,
      family: 4,
    });
    console.log('MongoDB connected');
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    const message = err instanceof Error ? err.message : String(err);
    if (code === 'ECONNREFUSED' && message.includes('querySrv')) {
      printDnsHelp();
    }
    throw err;
  }
}
