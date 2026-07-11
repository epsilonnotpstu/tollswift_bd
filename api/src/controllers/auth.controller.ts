import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { getGoogleOAuthUrl } from '../services/google.service';
import { success } from '../utils/response';

export const register = async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  return success(res, data, 'Registration successful. OTP sent to email.', 201);
};

export const login = async (req: Request, res: Response) => {
  const data = await authService.loginWithEmail(req.body.email, req.body.password);
  return success(res, data, 'Login successful');
};

export const sendOTP = async (req: Request, res: Response) => {
  const data = await authService.sendEmailOTP(req.body.email);
  return success(res, data, 'OTP sent successfully');
};

export const verifyOTP = async (req: Request, res: Response) => {
  const data = await authService.verifyEmailOTP(req.body.email, req.body.code);
  return success(res, data, 'Email verified successfully');
};

export const googleAuth = async (req: Request, res: Response) => {
  const data = await authService.googleAuth(req.body.idToken);
  return success(res, data, 'Google login successful');
};

// Mobile OAuth redirect flow
export const googleRedirect = (_req: Request, res: Response) => {
  const url = getGoogleOAuthUrl();
  res.redirect(url);
};

export const googleCallback = async (req: Request, res: Response) => {
  const { code, error } = req.query;
  if (error || !code) {
    return res.redirect('tollbd://auth/callback?error=cancelled');
  }
  try {
    const data = await authService.googleAuthFromCode(code as string);
    const params = new URLSearchParams({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: Buffer.from(JSON.stringify(data.user)).toString('base64')
    });
    return res.redirect(`tollbd://auth/callback?${params.toString()}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Google auth failed';
    return res.redirect(`tollbd://auth/callback?error=${encodeURIComponent(msg)}`);
  }
};

export const refresh = async (req: Request, res: Response) => {
  const data = await authService.refreshTokens(req.body.refreshToken);
  return success(res, data, 'Token refreshed');
};

export const logout = async (req: Request, res: Response) => {
  const data = await authService.logout(req.user?.id ?? '', req.body.refreshToken);
  return success(res, data, 'Logout successful');
};
