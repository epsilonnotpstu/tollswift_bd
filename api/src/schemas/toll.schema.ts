import { PaymentMethod, TransactionStatus, VehicleCategory } from '@prisma/client';
import { z } from 'zod';

export const initPaymentSchema = z.object({
  vehicleId: z.string().uuid(),
  bridgeId: z.string().uuid(),
  method: z.nativeEnum(PaymentMethod)
});

export const refundSchema = z.object({
  reason: z.string().min(3).max(500),
  amount: z.coerce.number().int().positive().optional()
});

export const tollCalculateSchema = z.object({
  bridgeId: z.string().uuid(),
  category: z.nativeEnum(VehicleCategory)
});

export const transactionFilterSchema = z.object({
  status: z.nativeEnum(TransactionStatus).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});
