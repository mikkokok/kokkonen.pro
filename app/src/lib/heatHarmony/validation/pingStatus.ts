import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const PingResponseSchema = z.object({
  status: z.string().nullable(),
  serverTime: isoLocalOrOffsetDateTimeSchema.optional(),
});

export type PingResponse = z.infer<typeof PingResponseSchema>;