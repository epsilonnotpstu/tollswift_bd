import { apiClient, unwrap } from './client';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/auth.types';

export const sendOTP = (email: string) => {
  return apiClient.post('/auth/otp/send', { email }).then(unwrap<{ email: string; devCode?: string }>);
};

export const verifyOTP = (email: string, code: string) => {
  return apiClient.post('/auth/otp/verify', { email, code }).then(unwrap<AuthResponse>);
};

export const loginEmail = (data: LoginRequest) => {
  return apiClient.post('/auth/login', data).then(unwrap<AuthResponse>);
};

export const register = (data: RegisterRequest) => {
  return apiClient.post('/auth/register', data).then(unwrap<{ userId: string; email: string }>);
};

export const googleAuth = (idToken: string) => {
  return apiClient.post('/auth/google', { idToken }).then(unwrap<AuthResponse>);
};

export const refresh = (refreshToken: string) => {
  return apiClient.post('/auth/refresh', { refreshToken }).then(unwrap<{ accessToken: string; refreshToken: string }>);
};

export const logout = () => {
  return apiClient.post('/auth/logout').then(unwrap<{ loggedOut: boolean }>);
};

export const getMe = () => {
  return apiClient.get('/users/me').then(unwrap<User>);
};
