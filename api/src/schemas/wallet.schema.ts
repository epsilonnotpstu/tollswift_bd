import { z } from 'zod';

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20)
});

export const initDepositSchema = z.object({
  amount: z.coerce.number().positive(),
  method: z.enum(['SSLCOMMERZ', 'BKASH', 'NAGAD', 'CARD']).optional().default('SSLCOMMERZ')
});

export const sslCallbackSchema = z.object({}).passthrough();
