import {formatDateFi} from '../dateTimeFormat';
import {scaleConsumptionValue} from './consumptionDisplay';
import type {ConsumptionData} from './validation/consumptionData';
import {spotPriceAt, usedPriceEurPerKWh, yieldPriceEurPerKWh} from './pricing';

export interface DailyEnergyTotals {
  date: string;
  sortTs: number;
  usedKWh: number;
  yieldKWh: number;
}

export interface PreparedConsumptionPoint {
  timestamp: number;
  date: Date;
  day: string;
  data: ConsumptionData['data'];
}

export interface DailyEnergySummary extends DailyEnergyTotals {
  usedPricedKWh: number;
  usedUnpricedKWh: number;
  usedCostEur: number;
  yieldPricedKWh: number;
  yieldUnpricedKWh: number;
  yieldProvidedEur: number;
  netCostEur: number;
}

export function prepareConsumptionHistory(historyData: ConsumptionData[] | null | undefined): PreparedConsumptionPoint[] {
  return (historyData ?? [])
    .map((point) => {
      const date = new Date(point.timestamp);
      return {timestamp: date.getTime(), date, day: '', data: point.data};
    })
    .filter((point) => Number.isFinite(point.timestamp))
    .sort((previous, current) => previous.timestamp - current.timestamp)
    .map((point) => ({...point, day: formatDateFi(point.date)}));
}

export function buildDailyEnergySummary(
  history: PreparedConsumptionPoint[],
  spotPrices: Record<string, number>
): DailyEnergySummary[] {
  const perDay = new Map<
    string,
    {
      sortTs: number;
      counters: {firstUsed: number; lastUsed: number; firstYield: number; lastYield: number} | null;
      usedPricedKWh: number;
      usedUnpricedKWh: number;
      usedCostEur: number;
      yieldPricedKWh: number;
      yieldUnpricedKWh: number;
      yieldProvidedEur: number;
    }
  >();

  for (let index = 0; index < history.length; index += 1) {
    const point = history[index];
    let totals = perDay.get(point.day);
    if (!totals) {
      totals = {
        sortTs: point.timestamp,
        counters: null,
        usedPricedKWh: 0,
        usedUnpricedKWh: 0,
        usedCostEur: 0,
        yieldPricedKWh: 0,
        yieldUnpricedKWh: 0,
        yieldProvidedEur: 0,
      };
      perDay.set(point.day, totals);
    }

    const cumulativeConsumptionWh = point.data.CumulativePowerConsumption;
    const cumulativeYieldWh = point.data.CumulativePowerYield;
    if (cumulativeConsumptionWh !== undefined && cumulativeYieldWh !== undefined) {
      if (!totals.counters) {
        totals.sortTs = point.timestamp;
        totals.counters = {
          firstUsed: cumulativeConsumptionWh,
          lastUsed: cumulativeConsumptionWh,
          firstYield: cumulativeYieldWh,
          lastYield: cumulativeYieldWh,
        };
      } else {
        totals.counters.lastUsed = cumulativeConsumptionWh;
        totals.counters.lastYield = cumulativeYieldWh;
      }
    }

    const previous = history[index - 1];
    if (!previous) continue;

    const spotPrice = spotPriceAt(spotPrices, point.date);
    const previousUsedWh = previous.data.CumulativePowerConsumption;
    const previousYieldWh = previous.data.CumulativePowerYield;
    if (previousUsedWh !== undefined && cumulativeConsumptionWh !== undefined) {
      const usedKWh = scaleConsumptionValue('CumulativePowerConsumption', Math.max(0, cumulativeConsumptionWh - previousUsedWh));
      if (spotPrice === undefined) {
        totals.usedUnpricedKWh += usedKWh;
      } else {
        totals.usedPricedKWh += usedKWh;
        totals.usedCostEur += usedKWh * usedPriceEurPerKWh(spotPrice);
      }
    }
    if (previousYieldWh !== undefined && cumulativeYieldWh !== undefined) {
      const yieldKWh = scaleConsumptionValue('CumulativePowerYield', Math.max(0, cumulativeYieldWh - previousYieldWh));
      if (spotPrice === undefined) {
        totals.yieldUnpricedKWh += yieldKWh;
      } else {
        totals.yieldPricedKWh += yieldKWh;
        totals.yieldProvidedEur += yieldKWh * yieldPriceEurPerKWh(spotPrice);
      }
    }
  }

  return Array.from(perDay.entries())
    .filter(([, values]) => values.counters !== null)
    .map(([date, values]) => {
      const counters = values.counters!;
      const usedWh = Math.max(0, counters.lastUsed - counters.firstUsed);
      const yieldWh = Math.max(0, counters.lastYield - counters.firstYield);

      return {
        date,
        sortTs: values.sortTs,
        usedKWh: scaleConsumptionValue('CumulativePowerConsumption', usedWh),
        yieldKWh: scaleConsumptionValue('CumulativePowerYield', yieldWh),
        usedPricedKWh: values.usedPricedKWh,
        usedUnpricedKWh: values.usedUnpricedKWh,
        usedCostEur: values.usedCostEur,
        yieldPricedKWh: values.yieldPricedKWh,
        yieldUnpricedKWh: values.yieldUnpricedKWh,
        yieldProvidedEur: values.yieldProvidedEur,
        netCostEur: values.usedCostEur - values.yieldProvidedEur,
      };
    })
    .sort((a, b) => b.sortTs - a.sortTs);
}

export function buildDailyEnergyTotals(historyData: ConsumptionData[] | null | undefined): DailyEnergyTotals[] {
  return buildDailyEnergySummary(prepareConsumptionHistory(historyData), {}).map(({date, sortTs, usedKWh, yieldKWh}) => (
    {date, sortTs, usedKWh, yieldKWh}
  ));
}
