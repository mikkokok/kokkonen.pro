import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heatAutomationOverrideResponseSchema = z.object({
  message: z.string(),
  temperature: z.number(),
  hours: z.number(),
  delayHours: z.number(),
  requestedAt: isoLocalOrOffsetDateTimeSchema,
});

export type HeatAutomationOverrideResponse = z.infer<typeof heatAutomationOverrideResponseSchema>;