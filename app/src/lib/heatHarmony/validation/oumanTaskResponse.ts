import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const oumanTaskResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  status: z.string().nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
});

export type OumanTaskResponse = z.infer<typeof oumanTaskResponseSchema>;