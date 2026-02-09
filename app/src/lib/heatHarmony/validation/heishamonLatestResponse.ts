import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heishamonLatestResponseSchema = z.object({
  inletTemp: z.number(),
  outletTemp: z.number(),
  targetTemp: z.number(),
  serverTime: isoLocalOrOffsetDateTimeSchema,
});

export type HeishamonLatestResponse = z.infer<typeof heishamonLatestResponseSchema>;