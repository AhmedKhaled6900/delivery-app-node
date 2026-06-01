import dotenv from 'dotenv';

dotenv.config();

/** Strips whitespace, newlines, and surrounding quotes (common Railway paste mistakes). */
function cleanEnv(value: string | undefined): string | undefined {
  if (value == null || value === '') return undefined;
  return value
    .trim()
    .replace(/^["']+|["']+$/g, '')
    .replace(/\r?\n/g, '')
    .trim();
}

const isProduction = cleanEnv(process.env.NODE_ENV) === 'production';
const mongodbUri = cleanEnv(process.env.MONGODB_URI);

if (!mongodbUri) {
  throw new Error(
    [
      'MONGODB_URI is required.',
      '',
      'Local: add MONGODB_URI to your .env file.',
      'Railway: Variables → MONGODB_URI (no quotes around the value).',
      '',
      'Then redeploy.',
    ].join('\n')
  );
}

if (isProduction && mongodbUri === 'memory') {
  throw new Error('MONGODB_URI=memory is not allowed in production. Use MongoDB Atlas on Railway.');
}

const jwtSecret = cleanEnv(process.env.JWT_SECRET);
if (isProduction && !jwtSecret) {
  throw new Error(
    'JWT_SECRET is required in production. Add it in Railway → Variables (no quotes, single line).'
  );
}

const jwtExpiresIn = cleanEnv(process.env.JWT_EXPIRES_IN) || '7d';

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: cleanEnv(process.env.NODE_ENV) || 'development',
  mongodbUri,
  mongodbDbName: cleanEnv(process.env.MONGODB_DB_NAME) || 'delivery-app',
  useMemoryDb: mongodbUri === 'memory',
  jwt: {
    secret: jwtSecret || 'dev-secret-change-in-production',
    expiresIn: jwtExpiresIn,
  },
} as const;
