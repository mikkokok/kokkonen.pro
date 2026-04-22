import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heatAutomationOverrideStatusResponseSchema = z.object({
  isActive: z.boolean(),
  targetTemp: z.number(),
  until: isoLocalOrOffsetDateTimeSchema.nullable().optional(),
  serverTime: isoLocalOrOffsetDateTimeSchema,
});

export type HeatAutomationOverrideStatusResponse = z.infer<typeof heatAutomationOverrideStatusResponseSchema>;
