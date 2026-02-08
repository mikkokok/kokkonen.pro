import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const oumanTaskResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  status: z.string(),
  errors: z.array(z.string()).optional(),
});

export type OumanTaskResponse = z.infer<typeof oumanTaskResponseSchema>;