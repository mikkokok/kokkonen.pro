import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const pro3OverrideAcceptedResponseSchema = z.object({
  outputAmount: z.number(),
  output: z.boolean(),
  durationMinutes: z.number(),
  until: isoLocalOrOffsetDateTimeSchema,
});

export type Pro3OverrideAcceptedResponse = z.infer<typeof pro3OverrideAcceptedResponseSchema>;
