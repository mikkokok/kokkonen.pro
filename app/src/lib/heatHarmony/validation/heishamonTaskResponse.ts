import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heishamonTaskResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  status: z.string().nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
});

export type HeishamonTaskResponse = z.infer<typeof heishamonTaskResponseSchema>;