import { FuelType, VehicleCategory, VehicleType } from '@prisma/client';
import { z } from 'zod';

// BRTA formats: DHAKA-GA-11-1234 / DHAKA-A-11-1234 / 11G1234 / 11GA1234 / METRO-GA-11-12345 etc.
const brtaClassic = /^[A-Z]{2,15}-[A-Z]{1,3}-\d{2}-\d{3,5}$/;
const dhakaMetro  = /^\d{2}[A-Z]{1,3}\d{3,5}$/;
// Fallback: any plate-like string (letters, digits, hyphens, spaces) 3–30 chars
const genericPlate = /^[A-Z0-9][A-Z0-9\s-]{1,29}$/;

const registrationNumber = z
  .string()
  .trim()
  .min(3, 'রেজিস্ট্রেশন নম্বর কমপক্ষে ৩ অক্ষর হতে হবে')
  .max(30, 'রেজিস্ট্রেশন নম্বর সর্বোচ্চ ৩০ অক্ষর হতে পারবে')
  .transform((value) => value.toUpperCase().trim())
  .refine((value) => brtaClassic.test(value) || dhakaMetro.test(value) || genericPlate.test(value), {
    message: 'সঠিক রেজিস্ট্রেশন নম্বর দিন (যেমন: DHAKA-GA-11-1234)'
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
