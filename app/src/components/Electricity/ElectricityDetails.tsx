import {useEffect, useMemo, useState} from "react";
import {backendUrl} from "../../config/config";
import {ElectricityClient} from "../../lib/electricity/electricityClient";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

import {ConsumptionData, ConsumptionKeys, translateKey, translateUnit} from "../../lib/electricity/validation/consumptionData";
import {formatDateTimeFi, formatTimeFi} from '../../lib/dateTimeFormat';
import {
  buildDownsampledTimeSeriesChartData,
  createTimeAxisAndTooltipFormatters,
  TimeSeriesChartPoint,
} from '../../lib/charts/timeSeriesChart';

const cumulativePowerConsumptionKeys: ConsumptionKeys[] = ['CumulativePowerConsumption'];
const cumulativePowerYieldKeys: ConsumptionKeys[] = ['CumulativePowerYield'];
const voltageKeys: ConsumptionKeys[] = ['L1Voltage', 'L2Voltage', 'L3Voltage'];
const currentKeys: ConsumptionKeys[] = ['L1InstantPowerCurrent', 'L2InstantPowerCurrent', 'L3InstantPowerCurrent'];
const powerKeys: ConsumptionKeys[] = ['L1InstantPowerUsage', 'L2InstantPowerUsage', 'L3InstantPowerUsage'];

const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d884d8', '#ca9d82', '#58c6ff'];

function scaleValue(key: ConsumptionKeys, rawValue: number): number {
  if (voltageKeys.includes(key)) return rawValue / 1000;
  if (key.includes('Current')) return rawValue / 1000;
  if (key.includes('Cumulative')) return rawValue / 1000;
  return rawValue;
}

export function ElectricityDetails() {
  const electricityClient = useMemo(() => new ElectricityClient(backendUrl), []);
  const [historyData, setHistoryData] = useState<ConsumptionData[] | undefined>(undefined);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const historyData = await electricityClient.getHistoryData();
        setHistoryData(historyData);
      } catch (error) {
        console.log('Failed to fetch history data', error);
      }
    };

    void fetchHistoryData();

    const intervalId = setInterval(() => {
      void fetchHistoryData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [electricityClient]);

  const getChartFormatter = (keys: ConsumptionKeys[]) => {
    const isVoltageChart = keys.every(key => voltageKeys.includes(key));
    const isCurrentChart = keys.some(key => currentKeys.includes(key));
    const isPowerChart = keys.some(key => powerKeys.includes(key));
    const isCumulativeChart = keys.some(key => key.includes('Cumulative'));

    const units = Array.from(new Set(keys.map(translateUnit)));
    const hasSingleUnit = units.length === 1;
    const defaultUnit = hasSingleUnit ? units[0] : undefined;

    if (isVoltageChart) {
      return {
        domain: [220, 240] as [number, number],
        yAxisUnitLabel: 'V' as const,
        tickFormatter: (value: number) => `${value.toFixed(0)}`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} V`
      };
    }
    if (isCurrentChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        yAxisUnitLabel: 'A' as const,
        tickFormatter: (value: number) => `${value.toFixed(1)}`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} A`
      };
    }
    if (isCumulativeChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        yAxisUnitLabel: 'kWh' as const,
        tickFormatter: (value: number) => `${value.toFixed(0)}`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} kWh`
      };
    }
    if (isPowerChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        yAxisUnitLabel: 'W' as const,
        tickFormatter: (value: number) => `${value.toFixed(1)}`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} W`
      };
    }
    return {
      domain: ['auto', 'auto'] as ['auto', 'auto'],
      yAxisUnitLabel: defaultUnit,
      tickFormatter: undefined,
      tooltipFormatter: (value: number) => `${value.toFixed(2)}`
    };
  };

  const cumulativeConsumptionChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, cumulativePowerConsumptionKeys, {
        keyToLabel: translateKey,
        scaleValue,
      }),
    [historyData]
  );
  const cumulativeYieldChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, cumulativePowerYieldKeys, {
        keyToLabel: translateKey,
        scaleValue,
      }),
    [historyData]
  );
  const powerChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, powerKeys, {
        keyToLabel: translateKey,
        scaleValue,
      }),
    [historyData]
  );
  const voltageChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, voltageKeys, {
        keyToLabel: translateKey,
        scaleValue,
      }),
    [historyData]
  );
  const currentChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, currentKeys, {
        keyToLabel: translateKey,
        scaleValue,
      }),
    [historyData]
  );

  const renderChart = (
    title: string,
    description: string,
    keys: ConsumptionKeys[],
    chartData: TimeSeriesChartPoint[],
  ) => {
    const formatter = getChartFormatter(keys);
    const axisColor = '#fff';

    const {formatXAxisTick, formatTooltipLabel} = createTimeAxisAndTooltipFormatters(chartData, {
      formatDateShort: (ts) =>
        formatDateTimeFi(ts, {
          year: undefined,
          hour: undefined,
          minute: undefined,
          second: undefined,
        }),
      formatDateFull: (ts) =>
        formatDateTimeFi(ts, {
          hour: undefined,
          minute: undefined,
          second: undefined,
        }),
      formatTimeShort: (ts) => formatTimeFi(ts),
      formatTimeWithSeconds: (ts) => formatTimeFi(ts, {second: '2-digit'}),
    });

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData} margin={{top: 10, right: 12, left: 0, bottom: 24}}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={['dataMin', 'dataMax']}
                  className="text-xs"
                  tick={{fill: axisColor}}
                  stroke={axisColor}
                  tickLine={{stroke: axisColor}}
                  axisLine={{stroke: axisColor}}
                  tickFormatter={formatXAxisTick}
                  interval="preserveStartEnd"
                  minTickGap={40}
                  tickMargin={10}
                  height={55}
                />
                <YAxis
                  className="text-xs"
                  tick={{fill: axisColor}}
                  stroke={axisColor}
                  tickLine={{stroke: axisColor}}
                  axisLine={{stroke: axisColor}}
                  label={
                    formatter.yAxisUnitLabel
                      ? {
                        value: formatter.yAxisUnitLabel,
                        angle: -90,
                        position: 'insideLeft',
                        fill: axisColor,
                      }
                      : undefined
                  }
                  domain={formatter.domain}
                  tickFormatter={formatter.tickFormatter}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                  formatter={(value: number | undefined) =>
                    value !== undefined ? formatter.tooltipFormatter(value) : 'N/A'
                  }
                  labelFormatter={formatTooltipLabel}
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                {keys.map((key, index) => (

                  <Line
                    key={key}
                    type="monotone"
                    dataKey={translateKey(key)}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{r: 4}}
                    isAnimationActive={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Loading history data...</p>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Electricity details</h1>
      </div>

      {renderChart(
        'Cumulative Power Consumption',
        `Total energy consumption over time (${historyData?.length || 0} data points)`,
        cumulativePowerConsumptionKeys,
        cumulativeConsumptionChartData
      )}
      {renderChart(
        'Cumulative Power Yield',
        `Total energy yield over time (${historyData?.length || 0} data points)`,
        cumulativePowerYieldKeys,
        cumulativeYieldChartData
      )}
      {renderChart(
        'Power Details',
        `Detailed power usage, current, and voltage per phase (${historyData?.length || 0} data points)`,
        powerKeys,
        powerChartData
      )}
      {renderChart(
        'Voltage Details',
        `Detailed voltage per phase (${historyData?.length || 0} data points)`,
        voltageKeys,
        voltageChartData
      )}
      {renderChart(
        'Current Details',
        `Detailed current per phase (${historyData?.length || 0} data points)`,
        currentKeys,
        currentChartData
      )}
    </div>
  );
}