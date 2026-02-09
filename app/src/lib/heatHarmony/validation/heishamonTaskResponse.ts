import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heishamonTaskResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  status: z.string(),
  errors: z.array(z.string()).optional(),
});

export type HeishamonTaskResponse = z.infer<typeof heishamonTaskResponseSchema>;