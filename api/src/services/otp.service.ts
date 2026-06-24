import { Resend } from 'resend';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { AppError } from '../middleware/error.middleware';

const getResend = () => {
  if (!env.RESEND_API_KEY) {
    throw new AppError('Email service not configured (RESEND_API_KEY missing)', 503, 'EMAIL_SERVICE_UNAVAILABLE');
  }
  return new Resend(env.RESEND_API_KEY);
};

// In dev, use Resend's onboarding domain (no custom domain needed).
// In production, set RESEND_FROM_EMAIL to a verified domain address.
const getFromEmail = () => {
  if (env.NODE_ENV === 'production' && env.RESEND_FROM_EMAIL && !env.RESEND_FROM_EMAIL.includes('resend.dev')) {
    return `TollBD <${env.RESEND_FROM_EMAIL}>`;
  }
  return 'TollBD <onboarding@resend.dev>';
};

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

export const sendOTPEmail = async (email: string, code: string, name: string): Promise<{ devCode?: string }> => {
  // In development, log to console as fallback if email fails
  if (env.NODE_ENV !== 'production') {
    console.log(`\n🔑 OTP for ${email}: ${code}\n`);
  }

  const { data, error } = await getResend().emails.send({
    from: getFromEmail(),
    to: email,
    subject: 'TollBD - আপনার OTP কোড',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"></head>
      <body style="margin:0;padding:0;background:#F8F9FD;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FD;padding:40px 0;">
          <tr><td align="center">
            <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(27,79,219,0.08);">
              <tr>
                <td style="background:linear-gradient(135deg,#1B4FDB,#1a44c4);padding:32px 40px;text-align:center;">
                  <div style="font-size:36px;margin-bottom:8px;">🌉</div>
                  <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;">TollBD</h1>
                  <p style="color:rgba(255,255,255,0.7);margin:4px 0 0;font-size:13px;">স্মার্ট টোল পেমেন্ট</p>
                </td>
              </tr>
              <tr>
                <td style="padding:36px 40px;">
                  <p style="color:#5C6B8A;font-size:14px;margin:0 0 8px;">প্রিয় ${name},</p>
                  <h2 style="color:#0F1729;font-size:18px;margin:0 0 16px;">আপনার OTP কোড</h2>
                  <p style="color:#5C6B8A;font-size:14px;margin:0 0 24px;">TollBD অ্যাকাউন্ট যাচাই করতে নিচের কোডটি ব্যবহার করুন:</p>
                  <div style="background:#EEF2FF;border:2px dashed #1B4FDB;border-radius:12px;padding:24px;text-align:center;margin:0 0 24px;">
                    <span style="font-size:40px;font-weight:800;letter-spacing:12px;color:#1B4FDB;font-family:monospace;">${code}</span>
                  </div>
                  <div style="background:#FFF8E1;border-left:4px solid #F5A623;border-radius:4px;padding:12px 16px;margin:0 0 24px;">
                    <p style="color:#856404;font-size:13px;margin:0;">⏱ এই কোডটি <strong>১০ মিনিটের</strong> জন্য কার্যকর।</p>
                  </div>
                  <p style="color:#8B9DB8;font-size:12px;margin:0;">আপনি এই অনুরোধ না করে থাকলে এই ইমেইলটি উপেক্ষা করুন।</p>
                </td>
              </tr>
              <tr>
                <td style="background:#F8F9FD;padding:20px 40px;text-align:center;">
                  <p style="color:#B0BEC5;font-size:11px;margin:0;">© 2026 TollBD • স্মার্ট সেতু টোল সিস্টেম, বাংলাদেশ</p>
                </td>
              </tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `
  });

  if (error) {
    // In dev mode: don't fail — OTP is already logged to console
    if (env.NODE_ENV !== 'production') {
      console.warn(`⚠️  Email failed (${error.message}). Using console OTP above.`);
      return { devCode: code };
    }
    throw new AppError(
      `Email sending failed: ${error.message}`,
      502,
      'EMAIL_SEND_FAILED'
    );
  }

  return {};
};
