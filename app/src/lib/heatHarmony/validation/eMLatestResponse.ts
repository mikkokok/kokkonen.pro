import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const eMLatestResponseSchema = z.object({
  lastEnabled: isoLocalOrOffsetDateTimeSchema,
  isOverridden: z.boolean(),
  isRunning: z.boolean(),
  isOn: z.boolean(),
});

export type EMLatestResponse = z.infer<typeof eMLatestResponseSchema>;