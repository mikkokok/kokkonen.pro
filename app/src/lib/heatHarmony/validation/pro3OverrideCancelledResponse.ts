import {z} from 'zod';

export const pro3OverrideCancelledResponseSchema = z.object({
  message: z.string().nullable(),
});

export type Pro3OverrideCancelledResponse = z.infer<typeof pro3OverrideCancelledResponseSchema>;
