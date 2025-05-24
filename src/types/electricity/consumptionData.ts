import {z} from 'zod';

export const consumptionKeysSchema = z.enum([
  'ActualConsumption',
  'ActualReturndelivery',
  'L1InstantPowerUsage',
  'L2InstantPowerUsage',
  'L3InstantPowerUsage',
  'L1InstantPowerCurrent',
  'L2InstantPowerCurrent',
  'L3InstantPowerCurrent',
  'L1Voltage',
  'L2Voltage',
  'L3Voltage',
  'CumulativePowerConsumption',
  'CumulativePowerYield',
]);

export type ConsumptionKeys = z.infer<typeof consumptionKeysSchema>;

export const consumptionDataSchema = z.object({
  timestamp: z.string(),
  data: z.record(consumptionKeysSchema, z.number()),
});

export type ConsumptionData = z.infer<typeof consumptionDataSchema>;
