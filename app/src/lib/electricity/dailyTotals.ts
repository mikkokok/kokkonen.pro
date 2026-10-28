import {formatDateFi} from '../dateTimeFormat';
import {scaleConsumptionValue} from './consumptionDisplay';
import type {ConsumptionData} from './validation/consumptionData';

export interface DailyEnergyTotals {
  date: string;
  sortTs: number;
  usedKWh: number;
  yieldKWh: number;
}

export function buildDailyEnergyTotals(historyData: ConsumptionData[] | null | undefined): DailyEnergyTotals[] {
  if (!historyData || historyData.length === 0) {
    return [];
  }

  const sorted = [...historyData].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const perDay = new Map<
    string,
    {
      sortTs: number;
      firstConsumptionWh: number;
      lastConsumptionWh: number;
      firstYieldWh: number;
      lastYieldWh: number;
    }
  >();

  for (const point of sorted) {
    const ts = new Date(point.timestamp);
    if (Number.isNaN(ts.getTime())) {
      continue;
    }

    const dayKey = formatDateFi(ts);
    if (!dayKey || dayKey === '—') {
      continue;
    }

    const cumulativeConsumptionWh = point.data.CumulativePowerConsumption;
    const cumulativeYieldWh = point.data.CumulativePowerYield;
    if (cumulativeConsumptionWh === undefined || cumulativeYieldWh === undefined) {
      continue;
    }

    const existing = perDay.get(dayKey);
    if (!existing) {
      perDay.set(dayKey, {
        sortTs: ts.getTime(),
        firstConsumptionWh: cumulativeConsumptionWh,
        lastConsumptionWh: cumulativeConsumptionWh,
        firstYieldWh: cumulativeYieldWh,
        lastYieldWh: cumulativeYieldWh,
      });
      continue;
    }

    existing.lastConsumptionWh = cumulativeConsumptionWh;
    existing.lastYieldWh = cumulativeYieldWh;
  }

  return Array.from(perDay.entries())
    .map(([date, values]) => {
      const usedWh = Math.max(0, values.lastConsumptionWh - values.firstConsumptionWh);
      const yieldWh = Math.max(0, values.lastYieldWh - values.firstYieldWh);

      return {
        date,
        sortTs: values.sortTs,
        usedKWh: scaleConsumptionValue('CumulativePowerConsumption', usedWh),
        yieldKWh: scaleConsumptionValue('CumulativePowerYield', yieldWh),
      };
    })
    .sort((a, b) => b.sortTs - a.sortTs);
}
