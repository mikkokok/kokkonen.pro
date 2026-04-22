import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heatAutomationOverrideResponseSchema = z.object({
  message: z.string().nullable(),
  temperature: z.number(),
  hours: z.number(),
  delayHours: z.number(),
  quietMode: z.number().nullable().optional(),
  requestedAt: isoLocalOrOffsetDateTimeSchema,
});

export type HeatAutomationOverrideResponse = z.infer<typeof heatAutomationOverrideResponseSchema>;