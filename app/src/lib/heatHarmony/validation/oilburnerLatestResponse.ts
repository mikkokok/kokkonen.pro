import {z} from 'zod';

export const oilburnerLatestResponseSchema = z.object({
  isRunning: z.boolean(),
});

export type OilburnerLatestResponse = z.infer<typeof oilburnerLatestResponseSchema>;