import {z} from 'zod';
import {harmonyChangeSchema} from './harmonyChange';

export const heishamonStatusResponseSchema = z.object({
  changes: z.array(harmonyChangeSchema),
});

export type HeishamonStatusResponse = z.infer<typeof heishamonStatusResponseSchema>;