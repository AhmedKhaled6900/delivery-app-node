import mongoose from 'mongoose';
import { env } from './env';

function resolveMongoUri(uri: string): string {
  if (/mongodb(\+srv)?:\/\/[^/]+\/[^/?]+/.test(uri)) return uri;
  const [base, query = ''] = uri.split('?');
  const host = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${host}/${env.mongodbDbName}${query ? `?${query}` : ''}`;
}

export async function connectDB(): Promise<void> {
  const uri = resolveMongoUri(env.mongodbUri);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15_000,
    connectTimeoutMS: 15_000,
  });
  console.log('MongoDB connected');
}
