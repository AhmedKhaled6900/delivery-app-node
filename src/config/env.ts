import dotenv from 'dotenv';

dotenv.config();

function clean(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return value.trim().replace(/^["']+|["']+$/g, '').replace(/\r?\n/g, '');
}

const mongodbUri = clean(process.env.MONGODB_URI);
if (!mongodbUri) {
  throw new Error('MONGODB_URI is required in .env or Railway Variables');
}

const isProduction = clean(process.env.NODE_ENV) === 'production';
const jwtSecret = clean(process.env.JWT_SECRET);

if (isProduction && !jwtSecret) {
  throw new Error('JWT_SECRET is required when NODE_ENV=production');
}

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: clean(process.env.NODE_ENV) || 'development',
  mongodbUri,
  mongodbDbName: clean(process.env.MONGODB_DB_NAME) || 'delivery-app',
  jwt: {
    secret: jwtSecret || 'dev-secret',
    expiresIn: clean(process.env.JWT_EXPIRES_IN) || '7d',
  },
  otp: {
    expiresMinutes: Number(process.env.OTP_EXPIRES_MINUTES) || 10,
    maxAttempts: Number(process.env.OTP_MAX_ATTEMPTS) || 5,
    resendCooldownSeconds: Number(process.env.OTP_RESEND_COOLDOWN_SECONDS) || 60,
  },
  google: {
    clientId: clean(process.env.GOOGLE_CLIENT_ID),
  },
  smtp: {
    host: clean(process.env.SMTP_HOST),
    port: Number(process.env.SMTP_PORT) || 587,
    user: clean(process.env.SMTP_USER),
    pass: clean(process.env.SMTP_PASS),
    from: clean(process.env.SMTP_FROM) || 'noreply@delivery.app',
  },
  twilio: {
    accountSid: clean(process.env.TWILIO_ACCOUNT_SID),
    authToken: clean(process.env.TWILIO_AUTH_TOKEN),
    from: clean(process.env.TWILIO_PHONE_NUMBER),
  },
  corsOrigins: (clean(process.env.CORS_ORIGINS) || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
} as const;
