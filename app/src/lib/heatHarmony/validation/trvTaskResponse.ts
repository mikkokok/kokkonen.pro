import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const trvTaskResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  status: z.string().nullable(),
  errors: z.array(z.string()).optional(),
});

export type TrvTaskResponse = z.infer<typeof trvTaskResponseSchema>;