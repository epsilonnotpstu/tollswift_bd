import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

const getClient = () => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google OAuth not configured (GOOGLE_CLIENT_ID missing)', 503, 'OAUTH_SERVICE_UNAVAILABLE');
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
};

export const verifyGoogleToken = async (idToken: string) => {
  const ticket = await getClient().verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  if (!payload?.sub || !payload.email) {
    throw new AppError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN');
  }

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    photoUrl: payload.picture
  };
};
