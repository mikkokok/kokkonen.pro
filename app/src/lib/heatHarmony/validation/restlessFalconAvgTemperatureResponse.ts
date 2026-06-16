import {z} from 'zod';

export const restlessFalconAvgTemperatureResponseSchema = z.object({
  averageTemperature: z.number(),
});

export type RestlessFalconAvgTemperatureResponse = z.infer<typeof restlessFalconAvgTemperatureResponseSchema>;
