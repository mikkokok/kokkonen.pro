import {ConsumptionKeys, translateUnit} from './validation/consumptionData';

export function scaleConsumptionValue(key: ConsumptionKeys, rawValue: number): number {
  if (key.includes('InstantPowerCurrent')) return rawValue / 1000;
  if (key.includes('Voltage')) return rawValue / 1000;
  if (key.includes('Cumulative')) return rawValue / 1000;
  return rawValue;
}

export function getDisplayUnitForConsumptionKey(key: ConsumptionKeys): string {
  if (key.includes('InstantPowerCurrent')) return 'A';
  if (key.includes('Voltage')) return 'V';
  if (key.includes('Cumulative')) return 'kWh';
  return translateUnit(key);
}

export function formatConsumptionReading(key: ConsumptionKeys, rawValue: number | undefined): string {
  if (rawValue === undefined || rawValue === null || Number.isNaN(rawValue)) {
    return `— ${getDisplayUnitForConsumptionKey(key)}`;
  }

  const scaled = scaleConsumptionValue(key, rawValue);

  if (key.includes('InstantPowerCurrent')) return `${scaled.toFixed(2)} ${getDisplayUnitForConsumptionKey(key)}`;
  if (key.includes('Voltage')) return `${scaled.toFixed(1)} ${getDisplayUnitForConsumptionKey(key)}`;
  if (key.includes('Cumulative')) return `${scaled.toFixed(2)} ${getDisplayUnitForConsumptionKey(key)}`;

  return `${rawValue} ${getDisplayUnitForConsumptionKey(key)}`;
}
