import { Router } from 'express';
import * as controller from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { authLimiter, otpLimiter } from '../middleware/rateLimit.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  googleAuthSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  sendOTPSchema,
  verifyOTPSchema
} from '../schemas/auth.schema';

export const authRoutes = Router();

authRoutes.post('/register', authLimiter, validate(registerSchema), controller.register);
authRoutes.post('/login', authLimiter, validate(loginSchema), controller.login);
authRoutes.post('/otp/send', otpLimiter, validate(sendOTPSchema), controller.sendOTP);
authRoutes.post('/otp/verify', authLimiter, validate(verifyOTPSchema), controller.verifyOTP);
authRoutes.post('/google', authLimiter, validate(googleAuthSchema), controller.googleAuth);
authRoutes.post('/refresh', validate(refreshSchema), controller.refresh);
authRoutes.post('/logout', requireAuth, controller.logout);
