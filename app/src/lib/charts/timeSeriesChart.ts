export type TimestampedDataPoint<K extends string> = {
  timestamp: string;
  data: Partial<Record<K, number>>;
};

export type TimeSeriesChartPoint = {
  ts: number;
} & Record<string, number | undefined>;

export const DEFAULT_MAX_CHART_POINTS = 2500;

export function buildDownsampledTimeSeriesChartData<K extends string>(
  history: Array<TimestampedDataPoint<K>> | null | undefined,
  keys: readonly K[],
  options: {
    maxPoints?: number;
    keyToLabel: (key: K) => string;
    scaleValue?: (key: K, rawValue: number) => number;
  }
): TimeSeriesChartPoint[] {
  if (!history || history.length === 0) return [];

  const maxPoints = options.maxPoints ?? DEFAULT_MAX_CHART_POINTS;
  const keyToLabel = options.keyToLabel;
  const scaleValue = options.scaleValue ?? ((_, value) => value);

  const parsed = history
    .map((record) => {
      const ts = new Date(record.timestamp).getTime();
      return {ts, data: record.data};
    })
    .filter((x) => Number.isFinite(x.ts));

  if (parsed.length === 0) return [];

  const bucketSize = Math.max(1, Math.ceil(parsed.length / maxPoints));
  if (bucketSize === 1) {
    return parsed.map((record) => {
      const point: TimeSeriesChartPoint = {ts: record.ts};
      for (const key of keys) {
        const rawValue = record.data[key];
        point[keyToLabel(key)] = typeof rawValue === 'number' ? scaleValue(key, rawValue) : undefined;
      }
      return point;
    });
  }

  const points: TimeSeriesChartPoint[] = [];
  for (let start = 0; start < parsed.length; start += bucketSize) {
    const end = Math.min(parsed.length, start + bucketSize);
    const point: TimeSeriesChartPoint = {ts: parsed[end - 1].ts};

    for (const key of keys) {
      let sum = 0;
      let count = 0;

      for (let index = start; index < end; index += 1) {
        const rawValue = parsed[index].data[key];
        if (typeof rawValue !== 'number') continue;
        sum += scaleValue(key, rawValue);
        count += 1;
      }

      point[keyToLabel(key)] = count > 0 ? sum / count : undefined;
    }

    points.push(point);
  }

  return points;
}

export function getTimeSpanMs(chartData: TimeSeriesChartPoint[]): number {
  if (chartData.length === 0) return 0;

  let minTs = Infinity;
  let maxTs = -Infinity;

  for (const point of chartData) {
    if (!Number.isFinite(point.ts)) continue;
    if (point.ts < minTs) minTs = point.ts;
    if (point.ts > maxTs) maxTs = point.ts;
  }

  return Number.isFinite(minTs) && Number.isFinite(maxTs) ? Math.max(0, maxTs - minTs) : 0;
}

export function createTimeAxisAndTooltipFormatters(
  chartData: TimeSeriesChartPoint[],
  formatters: {
    formatDateShort: (ts: number) => string;
    formatDateFull: (ts: number) => string;
    formatTimeShort: (ts: number) => string;
    formatTimeWithSeconds: (ts: number) => string;
  }
): {
  formatXAxisTick: (value: number | string) => string;
  formatTooltipLabel: (label: unknown) => string;
} {
  const timeSpanMs = getTimeSpanMs(chartData);

  const oneDayMs = 24 * 60 * 60 * 1000;
  const oneWeekMs = 7 * oneDayMs;

  const formatXAxisTick = (value: number | string) => {
    if (typeof value !== 'number') return String(value);

    if (timeSpanMs >= oneWeekMs) {
      return formatters.formatDateShort(value);
    }
    if (timeSpanMs >= oneDayMs) {
      return `${formatters.formatDateShort(value)} ${formatters.formatTimeShort(value)}`;
    }

    return formatters.formatTimeShort(value);
  };

  const formatTooltipLabel = (label: unknown) => {
    if (typeof label !== 'number') return String(label ?? '');
    return `${formatters.formatDateFull(label)} ${formatters.formatTimeWithSeconds(label)}`;
  };

  return {formatXAxisTick, formatTooltipLabel};
}
