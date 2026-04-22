import {z} from 'zod';
import {harmonyChangeSchema} from './harmonyChange';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heishamonStatusResponseSchema = z.object({
  changes: z.array(harmonyChangeSchema).nullable().optional(),
  serverTime: isoLocalOrOffsetDateTimeSchema.optional(),
});

export type HeishamonStatusResponse = z.infer<typeof heishamonStatusResponseSchema>;