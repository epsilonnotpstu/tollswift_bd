import { z } from 'zod';

export const updateMeSchema = z.object({
  fullName: z.string().min(2).max(120).optional(),
  phone: z.string().min(6).max(30).optional(),
  division: z.string().max(80).optional(),
  district: z.string().max(80).optional(),
  emergencyContact: z.string().max(80).optional()
});
