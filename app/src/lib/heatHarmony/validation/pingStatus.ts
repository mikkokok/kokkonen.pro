import { z } from 'zod';

export const PingResponseSchema = z.object({
  status: z.string().nullable(),
  serverTime: z.string().datetime().optional(),
});

export type PingResponse = z.infer<typeof PingResponseSchema>;