import {z} from 'zod';

export const selectedTempsResponseSchema = z.object({
  minTemp: z.number(),
  midTemp: z.number(),
  maxTemp: z.number(),
  maxHeatingPeriodTemp: z.number(),
});

export type SelectedTempsResponse = z.infer<typeof selectedTempsResponseSchema>;
