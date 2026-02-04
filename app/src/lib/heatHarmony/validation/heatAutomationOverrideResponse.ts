import {z} from 'zod';

export const heatAutomationOverrideResponseSchema = z.object({
  message: z.string(),
  temperature: z.number(),
  hours: z.number(),
  delayHours: z.number(),
  requestedAt: z.string().datetime(),
});

export type HeatAutomationOverrideResponse = z.infer<typeof heatAutomationOverrideResponseSchema>;