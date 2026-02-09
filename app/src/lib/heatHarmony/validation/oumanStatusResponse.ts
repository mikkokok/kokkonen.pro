import {z} from 'zod';
import {harmonyChangeSchema} from './harmonyChange';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const oumanStatusResponseSchema = z.object({
  changes: z.array(harmonyChangeSchema),
  serverTime: isoLocalOrOffsetDateTimeSchema,
});

export type OumanStatusResponse = z.infer<typeof oumanStatusResponseSchema>;