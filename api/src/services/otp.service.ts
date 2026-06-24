import { Resend } from 'resend';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

const resend = new Resend(env.RESEND_API_KEY);

export const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

export const saveOTP = async (userId: string, code: string) => {
  await prisma.otp.deleteMany({ where: { userId, used: false } });

  return prisma.otp.create({
    data: {
      userId,
      code,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000)
    }
  });
};

export const verifyOTP = async (userId: string, code: string) => {
  const otp = await prisma.otp.findFirst({
    where: { userId, used: false },
    orderBy: { createdAt: 'desc' }
  });

  if (!otp) {
    throw new AppError('OTP not found. Please request a new code.', 404, 'OTP_NOT_FOUND');
  }

  if (otp.expiresAt < new Date()) {
    await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });
    throw new AppError('OTP expired. Please request a new code.', 400, 'OTP_EXPIRED');
  }

  if (otp.attempts >= 3) {
    await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });
    throw new AppError('Too many wrong attempts. Please request a new code.', 429, 'OTP_ATTEMPTS_EXCEEDED');
  }

  if (otp.code !== code) {
    const attempts = otp.attempts + 1;
    await prisma.otp.update({ where: { id: otp.id }, data: { attempts, used: attempts >= 3 } });
    throw new AppError(
      attempts >= 3 ? 'Too many wrong attempts. Please request a new code.' : 'Invalid OTP code',
      attempts >= 3 ? 429 : 400,
      attempts >= 3 ? 'OTP_ATTEMPTS_EXCEEDED' : 'INVALID_OTP'
    );
  }

  await prisma.otp.update({ where: { id: otp.id }, data: { used: true } });
  return true;
};

export const sendOTPEmail = async (email: string, code: string, name: string) => {
  await resend.emails.send({
    from: env.RESEND_FROM_EMAIL,
    to: email,
    subject: 'TollBD - আপনার OTP কোড',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; color: #0F1729;">
        <h2 style="color: #1B4FDB;">TollBD OTP Verification</h2>
        <p>প্রিয় ${name},</p>
        <p>আপনার TollBD অ্যাকাউন্ট যাচাই করার OTP কোড:</p>
        <div style="font-size: 32px; font-weight: 700; letter-spacing: 8px; background: #EEF2FF; color: #1B4FDB; padding: 18px; text-align: center; border-radius: 8px;">
          ${code}
        </div>
        <p>এই কোডটি ১০ মিনিটের জন্য কার্যকর থাকবে।</p>
        <p style="color: #5C6B8A;">আপনি এই অনুরোধ না করে থাকলে ইমেইলটি উপেক্ষা করুন।</p>
      </div>
    `
  });
};
