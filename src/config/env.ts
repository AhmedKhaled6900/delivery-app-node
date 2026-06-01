import dotenv from 'dotenv';

dotenv.config();

const mongodbUri = process.env.MONGODB_URI?.trim();

if (!mongodbUri) {
  throw new Error(
    'MONGODB_URI is required. Add it to your .env file (e.g. MongoDB Atlas connection string).'
  );
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri,
  mongodbDbName: process.env.MONGODB_DB_NAME || 'delivery-app',
  useMemoryDb: mongodbUri === 'memory',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;
