import {useEffect, useMemo, useState} from 'react';
import {CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Brush} from 'recharts';

import {backendUrl} from '../config/config';
import {formatDateTimeFi} from '../lib/dateTimeFormat';
import {HeatHarmonyClient} from '../lib/heatHarmony/heatHarmonyClient';
import {HeishamonLatestResponse} from '../lib/heatHarmony/validation/heishamonLatestResponse';
import {OumanLatestResponse} from '../lib/heatHarmony/validation/oumanLatestResponse';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';

type HistoryPoint = {
  time: string;
  inletTemp: number;
  outletTemp: number;
  targetTemp: number;
  quietMode: number;
  pumpFlow: number;
  heatEnergyProduction: number;
  heatEnergyConsumption: number;
  compressorFrequency: number;
  cop: number;
};

type OumanHistoryPoint = {
  time: string;
  outsideTemp: number;
  insideTemp: number;
  insideTempDemand: number;
  flowDemand: number;
  minFlowTemp: number;
};

type HistoryLineChartCardProps = {
  title: string;
  description: string;
  data: Array<Record<string, number | string>>;
  dataKey: string;
  stroke: string;
  valueFormatter: (value: number) => string;
};

function HistoryLineChartCard({
  title,
  description,
  data,
  dataKey,
  stroke,
  valueFormatter,
}: HistoryLineChartCardProps) {
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
        <ResponsiveContainer width="100%" height={380}>
          <LineChart data={data} margin={{top: 10, right: 20, left: 10, bottom: 80}}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="time"
              className="text-xs"
              tick={axisTick}
              tickLine={axisTickLine}
              axisLine={axisLine}
              angle={-45}
              textAnchor="end"
              height={70}
              minTickGap={50}
            />
            <YAxis
              className="text-xs"
              tick={axisTick}
              tickLine={axisTickLine}
              axisLine={axisLine}
              width={55}
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
            <Brush dataKey="time" height={30} stroke="var(--border)" fill="var(--muted)/0.3" travellerWidth={8} />
            <Line type="monotone" dataKey={dataKey} stroke={stroke} strokeWidth={2} dot={false} activeDot={{r: 4}} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export function HomeHeatingCharts() {
  const [heishamonHistory, setHeishamonHistory] = useState<HeishamonLatestResponse[] | undefined>(undefined);
  const [oumanHistory, setOumanHistory] = useState<OumanLatestResponse[] | undefined>(undefined);
  const [error, setError] = useState<string | undefined>(undefined);

  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setError(undefined);
        const [heishamon, ouman] = await Promise.all([
          heatHarmonyClient.getLatestHeishamonHistoryData().catch((e) => {
            console.warn('Failed to fetch Heishamon history:', e);
            return undefined;
          }),
          heatHarmonyClient.getOumanLatestHistory().catch((e) => {
            console.warn('Failed to fetch Ouman history:', e);
            return undefined;
          }),
        ]);
        if (heishamon) setHeishamonHistory(heishamon);
        if (ouman) setOumanHistory(ouman);
      } catch (e) {
        console.warn('Failed to fetch history:', e);
        setError('Failed to fetch history data.');
      }
    };

    void fetchHistory();
    const interval = setInterval(() => {
      void fetchHistory();
    }, 60000);

    return () => clearInterval(interval);
  }, [heatHarmonyClient]);

  const heishamonSeries: HistoryPoint[] = (heishamonHistory ?? [])
    .filter((r) => r?.serverTime)
    .map((r) => ({
      time: formatDateTimeFi(r.serverTime),
      inletTemp: r.inletTemp,
      outletTemp: r.outletTemp,
      targetTemp: r.targetTemp,
      quietMode: r.quietMode,
      pumpFlow: r.pumpFlow,
      heatEnergyProduction: r.heatEnergyProduction,
      heatEnergyConsumption: r.heatEnergyConsumption,
      compressorFrequency: r.compressorFrequency,
      cop: r.cop ?? 0,
    }));

  const oumanSeries: OumanHistoryPoint[] = (oumanHistory ?? [])
    .filter((r) => r?.serverTime)
    .map((r) => ({
      time: formatDateTimeFi(r.serverTime),
      outsideTemp: r.outsideTemp,
      insideTemp: r.insideTemp,
      insideTempDemand: r.insideTempDemand,
      flowDemand: r.flowDemand,
      minFlowTemp: r.minFlowTemp,
    }));

  const hasData = heishamonSeries.length > 0 || oumanSeries.length > 0;
  const chartColors = {
    chart1: 'var(--color-chart-1)',
    chart2: 'var(--color-chart-2)',
    chart3: 'var(--color-chart-3)',
    chart4: 'var(--color-chart-4)',
    chart5: 'var(--color-chart-5)',
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Homeheating details</h1>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : !hasData ? (
          <p className="text-sm text-muted-foreground">Loading history data…</p>
        ) : (
          <div className="space-y-6">
            <HistoryLineChartCard
              title="COP"
              description="Calculated from heatEnergyProduction / heatEnergyConsumption"
              data={heishamonSeries}
              dataKey="cop"
              stroke={chartColors.chart1}
              valueFormatter={(v) => v.toFixed(2)}
            />
            <HistoryLineChartCard
              title="Target temperature"
              description="Heat pump target temperature"
              data={heishamonSeries}
              dataKey="targetTemp"
              stroke={chartColors.chart2}
              valueFormatter={(v) => `${v.toFixed(1)}°C`}
            />
            <HistoryLineChartCard
              title="Inlet temperature"
              description="Heat pump inlet temperature"
              data={heishamonSeries}
              dataKey="inletTemp"
              stroke={chartColors.chart3}
              valueFormatter={(v) => `${v.toFixed(1)}°C`}
            />
            <HistoryLineChartCard
              title="Outlet temperature"
              description="Heat pump outlet temperature"
              data={heishamonSeries}
              dataKey="outletTemp"
              stroke={chartColors.chart4}
              valueFormatter={(v) => `${v.toFixed(1)}°C`}
            />
            <HistoryLineChartCard
              title="Heat power production"
              description="Heishamon heatEnergyProduction"
              data={heishamonSeries}
              dataKey="heatEnergyProduction"
              stroke={chartColors.chart5}
              valueFormatter={(v) => `${v.toFixed(0)} W`}
            />
            <HistoryLineChartCard
              title="Heat power consumption"
              description="Heishamon heatEnergyConsumption"
              data={heishamonSeries}
              dataKey="heatEnergyConsumption"
              stroke={chartColors.chart1}
              valueFormatter={(v) => `${v.toFixed(0)} W`}
            />
            <HistoryLineChartCard
              title="Pump flow"
              description="Heishamon pumpFlow"
              data={heishamonSeries}
              dataKey="pumpFlow"
              stroke={chartColors.chart2}
              valueFormatter={(v) => `${v.toFixed(1)} l/min`}
            />
            <HistoryLineChartCard
              title="Compressor frequency"
              description="Heishamon compressorFrequency"
              data={heishamonSeries}
              dataKey="compressorFrequency"
              stroke={chartColors.chart3}
              valueFormatter={(v) => `${v.toFixed(0)} Hz`}
            />
            <HistoryLineChartCard
              title="Quiet mode"
              description="Heishamon quietMode"
              data={heishamonSeries}
              dataKey="quietMode"
              stroke={chartColors.chart4}
              valueFormatter={(v) => v.toFixed(0)}
            />
            {oumanSeries.length > 0 && (
              <>
                <HistoryLineChartCard
                  title="Outside temperature"
                  description="Ouman outsideTemp"
                  data={oumanSeries}
                  dataKey="outsideTemp"
                  stroke={chartColors.chart5}
                  valueFormatter={(v) => `${v.toFixed(1)}°C`}
                />
                <HistoryLineChartCard
                  title="Inside temperature"
                  description="Ouman insideTemp"
                  data={oumanSeries}
                  dataKey="insideTemp"
                  stroke={chartColors.chart1}
                  valueFormatter={(v) => `${v.toFixed(1)}°C`}
                />
                <HistoryLineChartCard
                  title="Inside temperature demand"
                  description="Ouman insideTempDemand"
                  data={oumanSeries}
                  dataKey="insideTempDemand"
                  stroke={chartColors.chart2}
                  valueFormatter={(v) => `${v.toFixed(1)}°C`}
                />
                <HistoryLineChartCard
                  title="Flow demand"
                  description="Ouman flowDemand / minFlowTemp"
                  data={oumanSeries}
                  dataKey="flowDemand"
                  stroke={chartColors.chart3}
                  valueFormatter={(v) => `${v.toFixed(1)}°C`}
                />
                <HistoryLineChartCard
                  title="Minimum flow temperature"
                  description="Ouman minFlowTemp"
                  data={oumanSeries}
                  dataKey="minFlowTemp"
                  stroke={chartColors.chart4}
                  valueFormatter={(v) => `${v.toFixed(1)}°C`}
                />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
