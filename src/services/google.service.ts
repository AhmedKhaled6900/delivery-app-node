import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { normalizeEmail } from '../utils/phone';

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  name: string;
  emailVerified: boolean;
}

export async function verifyGoogleIdToken(idToken: string): Promise<GoogleUserInfo> {
  if (!env.google.clientId) {
    throw new ApiError(500, 'Google sign-in is not configured (GOOGLE_CLIENT_ID)');
  }

  const client = new OAuth2Client(env.google.clientId);
  const ticket = await client.verifyIdToken({
    idToken,
    audience: env.google.clientId,
  });

  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) {
    throw new ApiError(401, 'Invalid Google token');
  }

  return {
    googleId: payload.sub,
    email: normalizeEmail(payload.email),
    name: payload.name || payload.email.split('@')[0],
    emailVerified: payload.email_verified === true,
  };
}
