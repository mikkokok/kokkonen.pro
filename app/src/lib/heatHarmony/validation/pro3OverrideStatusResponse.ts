import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const pro3OverrideStatusResponseSchema = z.object({
  isOverridden: z.boolean(),
  until: isoLocalOrOffsetDateTimeSchema.nullable().optional(),
  outputAmount: z.number().nullable().optional(),
  outputState: z.boolean().nullable().optional(),
});

export type Pro3OverrideStatusResponse = z.infer<typeof pro3OverrideStatusResponseSchema>;
