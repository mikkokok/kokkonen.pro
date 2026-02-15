import {z} from 'zod';

export const oilburnerLatestResponseSchema = z.object({
  isRunning: z.boolean().optional(),
});

export type OilburnerLatestResponse = z.infer<typeof oilburnerLatestResponseSchema>;