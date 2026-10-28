export const TRANSFER_EUR_PER_KWH = 0.0191;
export const ENERGY_TAX_1_EUR_PER_KWH = 0.028112;
export const ENERGY_TAX_2_EUR_PER_KWH = 0.000163;
export const MARGIN_EUR_PER_KWH = 0.0038;
export const YIELD_FEE_EUR_PER_KWH = 0.003;

export const USED_ADDITIONAL_EUR_PER_KWH =
  TRANSFER_EUR_PER_KWH + ENERGY_TAX_1_EUR_PER_KWH + ENERGY_TAX_2_EUR_PER_KWH + MARGIN_EUR_PER_KWH;

export function hourKeyFromDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  return `${year}-${month}-${day}T${hour}`;
}

export function quarterKeyFromDate(date: Date): string {
  const quarterMinute = String(Math.floor(date.getMinutes() / 15) * 15).padStart(2, '0');
  return `${hourKeyFromDate(date)}:${quarterMinute}`;
}

// Handles both 15-minute and hourly price data.
export function spotPriceAt(spotPriceByInterval: Record<string, number>, date: Date): number | undefined {
  return spotPriceByInterval[quarterKeyFromDate(date)] ?? spotPriceByInterval[hourKeyFromDate(date)];
}

export function usedPriceEurPerKWh(spotPrice: number): number {
  return spotPrice + USED_ADDITIONAL_EUR_PER_KWH;
}

export function yieldPriceEurPerKWh(spotPrice: number): number {
  return spotPrice - YIELD_FEE_EUR_PER_KWH;
}
