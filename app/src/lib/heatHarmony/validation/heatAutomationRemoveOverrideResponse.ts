import {z} from 'zod';

export const heatAutomationRemoveOverrideResponseSchema = z.object({
  message: z.string(),
  cancelledAt: z.string().datetime(),
});

export type HeatAutomationRemoveOverrideResponse = z.infer<typeof heatAutomationRemoveOverrideResponseSchema>;