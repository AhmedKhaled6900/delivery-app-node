import dotenv from 'dotenv';

dotenv.config();

const mongodbUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/delivery-app';

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodbUri,
  useMemoryDb: mongodbUri === 'memory',
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
} as const;
