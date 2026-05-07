import {useEffect, useMemo, useState} from 'react';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis} from 'recharts';

import {backendUrl} from '../../config/config';
import {formatDateTimeFi} from '../../lib/dateTimeFormat';
import {WemosClient} from '../../lib/wemos/wemosClient';
import {WemosData, translateKey, translateUnit, WemosKeys} from '../../lib/wemos/validation/wemosData';
import {Badge} from '../ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';

// ESP8266 (Wemos D1 mini) practical heap is ~ 80 KB right after boot.
const TOTAL_HEAP_BYTES = 80 * 1024;
// WiFi signal mapping: -30 dBm = 100 %, -90 dBm = 0 %.
const WIFI_MIN_DBM = -90;
const WIFI_MAX_DBM = -30;
// Liveness thresholds based on age of the latest reading.
const STALE_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const OFFLINE_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes

type DeviceStatus = 'online' | 'stale' | 'offline' | 'unknown';

function computeStatus(latestTimestamp: string | undefined, now: number): {status: DeviceStatus; ageMs: number | undefined} {
  if (!latestTimestamp) return {status: 'unknown', ageMs: undefined};
  const ts = Date.parse(latestTimestamp);
  if (!Number.isFinite(ts)) return {status: 'unknown', ageMs: undefined};
  const ageMs = now - ts;
  if (ageMs >= OFFLINE_THRESHOLD_MS) return {status: 'offline', ageMs};
  if (ageMs >= STALE_THRESHOLD_MS) return {status: 'stale', ageMs};
  return {status: 'online', ageMs};
}

function formatAge(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  if (totalSec < 60) return `${totalSec}s ago`;
  const minutes = Math.floor(totalSec / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (hours < 24) return remMin > 0 ? `${hours}h ${remMin}m ago` : `${hours}h ago`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}d ${remHours}h ago` : `${days}d ago`;
}

type WemosHistoryPoint = {
  time: string;
} & Partial<Record<WemosKeys, number>>;

type WemosLineChartCardProps = {
  title: string;
  description: string;
  data: WemosHistoryPoint[];
  dataKey: WemosKeys;
  stroke: string;
  valueFormatter: (value: number) => string;
};

function WemosLineChartCard({
  title,
  description,
  data,
  dataKey,
  stroke,
  valueFormatter,
}: WemosLineChartCardProps) {
  const axisTick = {fill: 'var(--muted-foreground)'};
  const axisTickLine = {stroke: 'var(--muted-foreground)'};
  const axisLine = {stroke: 'var(--muted-foreground)'};

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={axisTick}
              tickLine={axisTickLine}
              axisLine={axisLine}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tick={axisTick}
              tickLine={axisTickLine}
              axisLine={axisLine}
              domain={['auto', 'auto']}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'var(--card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
              }}
              labelStyle={{color: 'var(--foreground)'}}
              formatter={(value: number | string | undefined) => {
                const v = typeof value === 'number' ? value : Number(value);
                return Number.isFinite(v) ? valueFormatter(v) : String(value ?? '—');
              }}
            />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} activeDot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

type UtilizationBarProps = {
  label: string;
  /** Percentage 0..100. Higher means more "used"/"problematic" (drives the warning color). */
  utilizationPercent: number;
  rawDisplay: string;
  hint?: string;
};

function UtilizationBar({label, utilizationPercent, rawDisplay, hint}: UtilizationBarProps) {
  const clamped = Math.min(100, Math.max(0, utilizationPercent));
  const barColor =
    clamped > 85 ? 'bg-red-500' : clamped > 60 ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground tabular-nums">
          {rawDisplay} <span className="ml-1">({clamped.toFixed(0)}%)</span>
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{width: `${clamped}%`}}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={label}
        />
      </div>
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${bytes.toFixed(0)} B`;
}

function formatUptime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '—';
  const totalSec = Math.floor(seconds);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (days > 0 || hours > 0) parts.push(`${hours}h`);
  if (days > 0 || hours > 0 || minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${secs}s`);
  return parts.join(' ');
}

function dbmToPercent(dbm: number): number {
  if (!Number.isFinite(dbm)) return 0;
  if (dbm >= WIFI_MAX_DBM) return 100;
  if (dbm <= WIFI_MIN_DBM) return 0;
  return ((dbm - WIFI_MIN_DBM) / (WIFI_MAX_DBM - WIFI_MIN_DBM)) * 100;
}

export function Wemos() {
  const [history, setHistory] = useState<WemosData[] | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);
  const [now, setNow] = useState<number>(() => Date.now());

  const wemosClient = useMemo(() => new WemosClient(backendUrl), []);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const interval = setInterval(tick, 30_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setError(undefined);
        const data = await wemosClient.getHistoryData();
        setHistory(data);
      } catch (e) {
        console.warn('Failed to fetch Wemos history:', e);
        setError('Failed to fetch Wemos history data.');
      }
    };

    void fetchHistory();
    const interval = setInterval(() => {
      void fetchHistory();
    }, 60000);

    return () => clearInterval(interval);
  }, [wemosClient]);

  const series: WemosHistoryPoint[] = (history ?? [])
    .filter((r) => r?.timestamp)
    .map((r) => ({
      time: formatDateTimeFi(r.timestamp),
      ...r.data,
    }));

  const latest = useMemo(() => {
    if (!history || history.length === 0) return undefined;
    for (let i = history.length - 1; i >= 0; i--) {
      const item = history[i];
      if (item?.data) return item;
    }
    return undefined;
  }, [history]);

  const hasData = series.length > 0;
  const chartColors = {
    chart1: 'var(--color-chart-1)',
    chart2: 'var(--color-chart-2)',
    chart3: 'var(--color-chart-3)',
    chart5: 'var(--color-chart-5)',
  };

  // Uptime gets a text display, not a chart. WifiSignalStrength remains useful as a line chart.
  const charts: Array<{key: WemosKeys; stroke: string; format: (v: number) => string}> = [
    {key: 'FreeHeap', stroke: chartColors.chart1, format: (v) => `${v.toFixed(0)} ${translateUnit('FreeHeap')}`},
    {key: 'HeapFragmentation', stroke: chartColors.chart2, format: (v) => `${v.toFixed(1)} ${translateUnit('HeapFragmentation')}`},
    {key: 'MaxFreeBlock', stroke: chartColors.chart3, format: (v) => `${v.toFixed(0)} ${translateUnit('MaxFreeBlock')}`},
    {key: 'WifiSignalStrength', stroke: chartColors.chart5, format: (v) => `${v.toFixed(0)} ${translateUnit('WifiSignalStrength')}`},
  ];

  const freeHeap = latest?.data?.FreeHeap;
  const heapFragmentation = latest?.data?.HeapFragmentation;
  const maxFreeBlock = latest?.data?.MaxFreeBlock;
  const uptime = latest?.data?.Uptime;
  const wifi = latest?.data?.WifiSignalStrength;

  const heapUsedBytes = typeof freeHeap === 'number' ? Math.max(0, TOTAL_HEAP_BYTES - freeHeap) : undefined;
  const heapUsedPercent =
    typeof heapUsedBytes === 'number' ? (heapUsedBytes / TOTAL_HEAP_BYTES) * 100 : 0;
  const fragmentationPercent = typeof heapFragmentation === 'number' ? heapFragmentation : 0;
  // Higher value = largest contiguous block is much smaller than free heap = bad fragmentation.
  const blockGapPercent =
    typeof maxFreeBlock === 'number' && typeof freeHeap === 'number' && freeHeap > 0
      ? Math.max(0, 100 - (maxFreeBlock / freeHeap) * 100)
      : 0;
  const wifiPercent = typeof wifi === 'number' ? dbmToPercent(wifi) : 0;
  const wifiLossPercent = 100 - wifiPercent;

  const {status, ageMs} = useMemo(() => computeStatus(latest?.timestamp, now), [latest?.timestamp, now]);
  const statusBadge: {label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; dot: string} = (() => {
    switch (status) {
      case 'online':
        return {label: 'Online', variant: 'secondary', dot: 'bg-emerald-500'};
      case 'stale':
        return {label: 'Stale', variant: 'outline', dot: 'bg-amber-500'};
      case 'offline':
        return {label: 'Offline', variant: 'destructive', dot: 'bg-red-500'};
      default:
        return {label: 'Unknown', variant: 'outline', dot: 'bg-muted-foreground'};
    }
  })();

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Wemos</h1>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : !hasData ? (
          <p className="text-sm text-muted-foreground">Loading Wemos history…</p>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Current status</span>
                  <Badge variant={statusBadge.variant} className="gap-1.5">
                    <span className={`inline-block size-2 rounded-full ${statusBadge.dot}`} aria-hidden />
                    {statusBadge.label}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {latest?.timestamp ? (
                    <>
                      Latest reading {formatDateTimeFi(latest.timestamp)}
                      {typeof ageMs === 'number' ? ` · ${formatAge(ageMs)}` : ''}
                      {status === 'offline'
                        ? ' · No new data in over 30 minutes — device likely offline.'
                        : status === 'stale'
                          ? ' · No new data in the last few minutes.'
                          : ''}
                    </>
                  ) : (
                    'Latest reading'
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <UtilizationBar
                  label="Heap used"
                  utilizationPercent={heapUsedPercent}
                  rawDisplay={
                    typeof freeHeap === 'number'
                      ? `${formatBytes(heapUsedBytes ?? 0)} / ${formatBytes(TOTAL_HEAP_BYTES)} used · ${formatBytes(freeHeap)} free`
                      : '—'
                  }
                  hint={`Assumes ~${formatBytes(TOTAL_HEAP_BYTES)} total heap on ESP8266.`}
                />
                <UtilizationBar
                  label="Heap fragmentation"
                  utilizationPercent={fragmentationPercent}
                  rawDisplay={
                    typeof heapFragmentation === 'number' ? `${heapFragmentation.toFixed(1)} %` : '—'
                  }
                />
                <UtilizationBar
                  label="Heap fragmentation gap"
                  utilizationPercent={blockGapPercent}
                  rawDisplay={
                    typeof maxFreeBlock === 'number'
                      ? `largest free block ${formatBytes(maxFreeBlock)}${typeof freeHeap === 'number' ? ` of ${formatBytes(freeHeap)} free` : ''
                      }`
                      : '—'
                  }
                  hint="100 % means the largest free block is much smaller than total free heap."
                />
                <UtilizationBar
                  label="WiFi signal loss"
                  utilizationPercent={wifiLossPercent}
                  rawDisplay={
                    typeof wifi === 'number'
                      ? `${wifi.toFixed(0)} dBm · ${wifiPercent.toFixed(0)} % strength`
                      : '—'
                  }
                  hint={`0 % at ${WIFI_MAX_DBM} dBm (excellent), 100 % at ${WIFI_MIN_DBM} dBm (unusable).`}
                />
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-sm font-medium">Uptime</span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {typeof uptime === 'number' ? formatUptime(uptime) : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {charts.map((c) => (
              <WemosLineChartCard
                key={c.key}
                title={translateKey(c.key)}
                description={`Wemos ${c.key}`}
                data={series}
                dataKey={c.key}
                stroke={c.stroke}
                valueFormatter={c.format}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Wemos;
