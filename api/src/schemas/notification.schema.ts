import { z } from 'zod';

export const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1)
  }),
  platform: z.string().optional()
});

export const unsubscribeSchema = z.object({
  endpoint: z.string().url()
});

export const broadcastSchema = z.object({
  title: z.string().min(1).max(120),
  body: z.string().min(1).max(500),
  icon: z.string().optional(),
  data: z.record(z.unknown()).optional()
});
