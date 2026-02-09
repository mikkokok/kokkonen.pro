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

export const validConsumptionKeys = consumptionKeysSchema.options;

export const consumptionDataSchema = z.object({
  timestamp: z.string(),
  data: z.record(consumptionKeysSchema, z.number()),
});

export type ConsumptionData = z.infer<typeof consumptionDataSchema>;

export function translateKey(key: ConsumptionKeys) {
  switch (key) {
    case 'ActualConsumption':
      return 'Actual consumption';
    case 'ActualReturndelivery':
      return 'Actual return delivery';
    case 'L1InstantPowerUsage':
      return 'L1 Instant power usage';
    case 'L2InstantPowerUsage':
      return 'L2 Instant power usage';
    case 'L3InstantPowerUsage':
      return 'L3 Instant power usage';
    case 'L1InstantPowerCurrent':
      return 'L1 Instant power current';
    case 'L2InstantPowerCurrent':
      return 'L2 Instant power current';
    case 'L3InstantPowerCurrent':
      return 'L3 Instant power current';
    case 'L1Voltage':
      return 'L1 voltage';
    case 'L2Voltage':
      return 'L2 voltage';
    case 'L3Voltage':
      return 'L3 voltage';
    case 'CumulativePowerConsumption':
      return 'Cumulative power consumption';
    case 'CumulativePowerYield':
      return 'Cumulative power yield';
  }
}

export function translateUnit(key: ConsumptionKeys) {
  switch (key) {
    case 'ActualConsumption':
    case 'ActualReturndelivery':
    case 'L1InstantPowerUsage':
    case 'L2InstantPowerUsage':
    case 'L3InstantPowerUsage':
      return 'W';
    case 'CumulativePowerConsumption':
    case 'CumulativePowerYield':
      return 'Wh';
    case 'L1InstantPowerCurrent':
    case 'L2InstantPowerCurrent':
    case 'L3InstantPowerCurrent':
      return 'A';
    case 'L1Voltage':
    case 'L2Voltage':
    case 'L3Voltage':
      return 'V';
  }
}
