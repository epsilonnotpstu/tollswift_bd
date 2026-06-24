import { Request, Response } from 'express';
import * as authService from '../services/auth.service';
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

export const refresh = async (req: Request, res: Response) => {
  const data = await authService.refreshTokens(req.body.refreshToken);
  return success(res, data, 'Token refreshed');
};

export const logout = async (req: Request, res: Response) => {
  const data = await authService.logout(req.user?.id ?? '', req.body.refreshToken);
  return success(res, data, 'Logout successful');
};
