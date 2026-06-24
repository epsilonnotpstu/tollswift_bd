import { AnnouncementType, UserStatus } from '@prisma/client';
import { z } from 'zod';

export const usersQuerySchema = z.object({
  search: z.string().optional(),
  status: z.nativeEnum(UserStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const blockUserSchema = z.object({
  blocked: z.coerce.boolean()
});

export const revenueQuerySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  groupBy: z.enum(['day', 'month']).default('day')
});

export const announcementSchema = z.object({
  title: z.string().min(1).max(160),
  titleBn: z.string().min(1).max(160),
  body: z.string().min(1).max(1000),
  bodyBn: z.string().min(1).max(1000),
  type: z.nativeEnum(AnnouncementType).default('INFO'),
  targetBridgeIds: z.array(z.string().uuid()).default([]),
  expiresAt: z.string().datetime().optional()
});
