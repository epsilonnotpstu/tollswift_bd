import { OAuth2Client } from 'google-auth-library';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

// Must be registered in Google Console → Authorized redirect URIs
export const GOOGLE_REDIRECT_URI = `${env.API_BASE_URL}/api/v1/auth/google/callback`;

const getClient = () => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google OAuth not configured (GOOGLE_CLIENT_ID missing)', 503, 'OAUTH_SERVICE_UNAVAILABLE');
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET);
};

const getRedirectClient = () => {
  if (!env.GOOGLE_CLIENT_ID) {
    throw new AppError('Google OAuth not configured', 503, 'OAUTH_SERVICE_UNAVAILABLE');
  }
  return new OAuth2Client(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
};

export const getGoogleOAuthUrl = () => {
  return getRedirectClient().generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/userinfo.profile'],
    prompt: 'select_account'
  });
};

export const exchangeGoogleCode = async (code: string) => {
  const client = getRedirectClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.id_token) throw new AppError('No ID token returned', 502, 'GOOGLE_TOKEN_ERROR');
  const ticket = await client.verifyIdToken({ idToken: tokens.id_token, audience: env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new AppError('Invalid Google token', 401, 'INVALID_GOOGLE_TOKEN');
  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name ?? payload.email.split('@')[0],
    photoUrl: payload.picture
  };
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
