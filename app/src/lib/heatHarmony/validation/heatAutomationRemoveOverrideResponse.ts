import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heatAutomationRemoveOverrideResponseSchema = z.object({
  message: z.string().nullable(),
  cancelledAt: isoLocalOrOffsetDateTimeSchema,
});

export type HeatAutomationRemoveOverrideResponse = z.infer<typeof heatAutomationRemoveOverrideResponseSchema>;