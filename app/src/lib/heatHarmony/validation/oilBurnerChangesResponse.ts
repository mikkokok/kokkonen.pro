import {z} from 'zod';
import {harmonyChangeSchema} from './harmonyChange';

export const oilBurnerChangesResponseSchema = z.object({
  changes: z.array(harmonyChangeSchema).nullable().optional(),
});

export type OilBurnerChangesResponse = z.infer<typeof oilBurnerChangesResponseSchema>;
