import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const registerSchema = z.object({
  email: z.string().email(),
  password: passwordSchema,
  fullName: z.string().min(2).max(120)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const sendOTPSchema = z.object({
  email: z.string().email()
});

export const verifyOTPSchema = z.object({
  email: z.string().email(),
  code: z.string().regex(/^\d{6}$/, 'OTP must be a 6-digit string')
});

export const googleAuthSchema = z.object({
  idToken: z.string().min(1)
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});
