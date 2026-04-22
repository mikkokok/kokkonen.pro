import {z} from 'zod';
import {harmonyChangeSchema} from './harmonyChange';

export const emChangesResponseSchema = z.object({
  changes: z.array(harmonyChangeSchema).nullable().optional(),
});

export type EmChangesResponse = z.infer<typeof emChangesResponseSchema>;
