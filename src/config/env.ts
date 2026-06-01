import dotenv from 'dotenv';

dotenv.config();

const isProduction = process.env.NODE_ENV === 'production';
const mongodbUri = process.env.MONGODB_URI?.trim();

if (!mongodbUri) {
  throw new Error(
    [
      'MONGODB_URI is required.',
      '',
      'Local: add MONGODB_URI to your .env file.',
      'Railway: open your project → Variables → New Variable',
      '  Name:  MONGODB_URI',
      '  Value: mongodb+srv://USER:PASS@cluster.mongodb.net/delivery-app?retryWrites=true&w=majority',
      '',
      'Then redeploy. (.env is not uploaded to Railway.)',
    ].join('\n')
  );
}

if (isProduction && mongodbUri === 'memory') {
  throw new Error('MONGODB_URI=memory is not allowed in production. Use MongoDB Atlas on Railway.');
}

const jwtSecret = process.env.JWT_SECRET?.trim();
if (isProduction && !jwtSecret) {
  throw new Error(
    'JWT_SECRET is required in production. Add it in Railway → Variables (same place as MONGODB_URI).'
  );
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri,
  mongodbDbName: process.env.MONGODB_DB_NAME || 'delivery-app',
  useMemoryDb: mongodbUri === 'memory',
  jwt: {
    secret: jwtSecret || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;
