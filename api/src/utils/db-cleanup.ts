import { prisma } from '../config/database';
import { logger } from '../config/logger';

export const cleanExpiredOTPs = async () => {
  const cutoff = new Date(Date.now() - 60 * 60 * 1000); // 1 hour
  const { count } = await prisma.otp.deleteMany({ where: { createdAt: { lt: cutoff } } });
  if (count > 0) logger.info(`DB cleanup: removed ${count} expired OTPs`);
};

export const cleanExpiredQRTokens = async () => {
  const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days
  const { count } = await prisma.qrToken.deleteMany({
    where: { OR: [{ used: true, usedAt: { lt: cutoff } }, { expiresAt: { lt: cutoff } }] }
  });
  if (count > 0) logger.info(`DB cleanup: removed ${count} expired/used QR tokens`);
};

export const runCleanup = async () => {
  try {
    await Promise.all([cleanExpiredOTPs(), cleanExpiredQRTokens()]);
  } catch (err) {
    logger.error('DB cleanup error', { err });
  }
};

export const scheduleCleanup = () => {
  runCleanup();
  setInterval(runCleanup, 6 * 60 * 60 * 1000); // every 6 hours
};
