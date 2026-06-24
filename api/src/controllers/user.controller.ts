import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { processProfilePhoto, saveToUploads } from '../middleware/upload.middleware';
import { success } from '../utils/response';

const publicUserSelect = {
  id: true,
  email: true,
  phone: true,
  fullName: true,
  photoUrl: true,
  nidNumber: true,
  role: true,
  status: true,
  division: true,
  district: true,
  emergencyContact: true,
  googleId: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true
};

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: req.user!.id },
    select: publicUserSelect
  });

  return success(res, user);
};

export const updateMe = async (req: Request, res: Response) => {
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: req.body,
    select: publicUserSelect
  });

  return success(res, user, 'Profile updated');
};

export const uploadPhoto = async (req: Request, res: Response) => {
  if (!req.file) {
    throw new AppError('Profile photo is required', 400, 'PHOTO_REQUIRED');
  }

  const filename = `${req.user!.id}-${Date.now()}.webp`;
  const photoBuffer = await processProfilePhoto(req.file.buffer);
  const photoUrl = await saveToUploads(photoBuffer, req.user!.id, `profile-${filename}`);
  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { photoUrl },
    select: publicUserSelect
  });

  return success(res, user, 'Profile photo updated');
};

export const deleteMe = async (req: Request, res: Response) => {
  const anonymizedEmail = `deleted-${req.user!.id}@deleted.tollbd.local`;
  await prisma.user.update({
    where: { id: req.user!.id },
    data: {
      status: 'BLOCKED',
      email: anonymizedEmail,
      phone: null,
      googleId: null,
      passwordHash: null,
      fullName: 'Deleted User'
    }
  });

  return success(res, { deleted: true }, 'Account deleted');
};
