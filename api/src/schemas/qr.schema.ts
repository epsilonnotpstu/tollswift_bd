import { z } from 'zod';

export const generateQRSchema = z.object({
  vehicleId: z.string().uuid()
});

export const scanQRSchema = z.object({
  tokenData: z.string().min(1),
  bridgeId: z.string().uuid()
});
