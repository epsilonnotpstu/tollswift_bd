import { FuelType, VehicleCategory, VehicleType } from '@prisma/client';
import { z } from 'zod';

const brtaClassic = /^[A-Z]+-[A-Z]+-\d{2}-\d{3,4}$/;
const dhakaMetro = /^\d{2}[A-Z]\d{4}$/;

const registrationNumber = z
  .string()
  .trim()
  .transform((value) => value.toUpperCase())
  .refine((value) => brtaClassic.test(value) || dhakaMetro.test(value), {
    message: 'Invalid BRTA registration number format'
  });

const vehicleBase = z.object({
  registrationNumber,
  vehicleType: z.nativeEnum(VehicleType),
  vehicleCategory: z.nativeEnum(VehicleCategory),
  ownerName: z.string().min(2).max(120),
  fuelType: z.nativeEnum(FuelType).optional(),
  brtaCertNumber: z.string().max(80).optional()
});

export const createVehicleSchema = vehicleBase;

export const updateVehicleSchema = vehicleBase.partial();

export const adminVerifySchema = z
  .object({
    action: z.enum(['APPROVE', 'REJECT']),
    rejectionReason: z.string().max(500).optional()
  })
  .superRefine((data, ctx) => {
    if (data.action === 'REJECT' && !data.rejectionReason?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rejectionReason'],
        message: 'Rejection reason is required when rejecting a vehicle'
      });
    }
  });

export const vehicleFilterSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).optional(),
  type: z.nativeEnum(VehicleType).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
