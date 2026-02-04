import {z} from 'zod';

export const heatAutomationStatusResponseSchema = z.object({
  isWorkerRunning: z.boolean(),
  serverTime: z.string().datetime(),
});

export type HeatAutomationStatusResponse = z.infer<typeof heatAutomationStatusResponseSchema>;
