import { Role, UserStatus } from '@prisma/client';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { comparePassword, hashPassword } from '../utils/hash';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { generateOTP, saveOTP, sendOTPEmail, verifyOTP } from './otp.service';
import { verifyGoogleToken } from './google.service';

const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  photoUrl: true,
  role: true,
  status: true,
  division: true,
  district: true,
  emergencyContact: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true
};

const buildAuthResponse = async (userId: string) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: publicUserSelect });
  const accessToken = signAccessToken(user.id, user.role);
  const refreshToken = signRefreshToken(user.id);

  return { user, accessToken, refreshToken };
};

export const register = async (data: { email: string; password: string; fullName: string }) => {
  const passwordHash = await hashPassword(data.password);

  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      passwordHash,
      fullName: data.fullName,
      status: UserStatus.UNVERIFIED,
      wallet: { create: { balance: 0 } }
    }
  });

  const code = generateOTP();
  await saveOTP(user.id, code);
  const emailResult = await sendOTPEmail(user.email, code, user.fullName);

  return { userId: user.id, email: user.email, ...(emailResult.devCode ? { devCode: emailResult.devCode } : {}) };
};

export const loginWithEmail = async (email: string, pass: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user?.passwordHash || !(await comparePassword(pass, user.passwordHash))) {
    throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
  }

  if (!user.emailVerified || user.status === UserStatus.UNVERIFIED) {
    throw new AppError('Please verify your email before login', 403, 'EMAIL_NOT_VERIFIED');
  }

  return buildAuthResponse(user.id);
};

export const sendEmailOTP = async (email: string) => {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: {
      email: normalizedEmail,
      fullName: normalizedEmail.split('@')[0],
      status: UserStatus.UNVERIFIED,
      wallet: { create: { balance: 0 } }
    }
  });

  const latestOtp = await prisma.otp.findFirst({
    where: { userId: user.id, used: false },
    orderBy: { createdAt: 'desc' }
  });

  if (latestOtp && Date.now() - latestOtp.createdAt.getTime() < 60 * 1000) {
    throw new AppError('Please wait 60 seconds before requesting another OTP', 429, 'OTP_COOLDOWN');
  }

  const code = generateOTP();
  await saveOTP(user.id, code);
  const emailResult = await sendOTPEmail(user.email, code, user.fullName);

  return { email: user.email, ...(emailResult.devCode ? { devCode: emailResult.devCode } : {}) };
};

export const verifyEmailOTP = async (email: string, code: string) => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  if (!user) {
    throw new AppError('User not found', 404, 'USER_NOT_FOUND');
  }

  await verifyOTP(user.id, code);
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, status: UserStatus.ACTIVE }
  });

  return buildAuthResponse(user.id);
};

export const googleAuth = async (idToken: string) => {
  const profile = await verifyGoogleToken(idToken);
  const user = await prisma.user.upsert({
    where: { email: profile.email.toLowerCase() },
    update: {
      googleId: profile.googleId,
      photoUrl: profile.photoUrl,
      emailVerified: true,
      status: UserStatus.ACTIVE
    },
    create: {
      email: profile.email.toLowerCase(),
      fullName: profile.name,
      googleId: profile.googleId,
      photoUrl: profile.photoUrl,
      emailVerified: true,
      status: UserStatus.ACTIVE,
      wallet: { create: { balance: 0 } }
    }
  });

  return buildAuthResponse(user.id);
};

export const refreshTokens = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.userId } });

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError('Account is blocked', 403, 'ACCOUNT_BLOCKED');
  }

  return {
    accessToken: signAccessToken(user.id, user.role),
    refreshToken: signRefreshToken(user.id)
  };
};

export const logout = async (_userId: string, _refreshToken?: string) => {
  return { loggedOut: true };
};
