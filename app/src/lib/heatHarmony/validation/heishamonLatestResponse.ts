import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heishamonLatestResponseSchema = z.object({
  inletTemp: z.number(),
  outletTemp: z.number(),
  targetTemp: z.number(),
  quietMode: z.number(),
  pumpFlow: z.number(),
  pumpError: z.string().nullable(),
  heatEnergyProduction: z.number(),
  heatEnergyConsumption: z.number(),
  compressorFrequency: z.number(),
  cop: z.number().optional(),
  serverTime: isoLocalOrOffsetDateTimeSchema,
}).transform((data) => {
  const consumption = data.heatEnergyConsumption;
  const cop = consumption > 0 ? data.heatEnergyProduction / consumption : 0;
  return {
    ...data,
    cop,
  };
});

export type HeishamonLatestResponse = z.output<typeof heishamonLatestResponseSchema>;