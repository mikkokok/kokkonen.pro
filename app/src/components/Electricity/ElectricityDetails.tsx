import {useEffect, useMemo, useState} from "react";
import {backendUrl} from "../../config/config";
import {ElectricityClient} from "../../lib/electricity/electricityClient";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

import {ConsumptionData, ConsumptionKeys, translateKey, translateUnit, validConsumptionKeys} from "../../lib/electricity/validation/consumptionData";
import {formatDateTimeFi} from '../../lib/dateTimeFormat';
export function ElectricityDetails() {
  const electricityClient = useMemo(() => new ElectricityClient(backendUrl), []);
  const [historyData, setHistoryData] = useState<ConsumptionData[] | undefined>(undefined);
  const cumulativePowerConsumption: ConsumptionKeys[] = ['CumulativePowerConsumption'];
  const cumulativePowerYield: ConsumptionKeys[] = ['CumulativePowerYield'];
  const voltageKeys: ConsumptionKeys[] = ['L1Voltage', 'L2Voltage', 'L3Voltage'];
  const currentKeys: ConsumptionKeys[] = ['L1InstantPowerCurrent', 'L2InstantPowerCurrent', 'L3InstantPowerCurrent'];
  const powerKeys: ConsumptionKeys[] = ['L1InstantPowerUsage', 'L2InstantPowerUsage', 'L3InstantPowerUsage'];
  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d884d8', '#ca9d82', '#58c6ff'];

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

  const chartData = historyData?.map((record) => ({
    timestamp: formatDateTimeFi(record.timestamp, {
      year: undefined,
      second: undefined,
    }),
    ...Object.fromEntries(
      validConsumptionKeys.map(key => {
        const value = record.data[key];
        if (value === undefined) {
          return [translateKey(key), undefined];
        }
        if (voltageKeys.includes(key)) {
          return [translateKey(key), value / 1000];
        }
        if (key.includes('Current')) {
          return [translateKey(key), value / 1000];
        }
        if (key.includes('Cumulative')) {
          return [translateKey(key), value / 1000];
        }
        return [translateKey(key), value];
      })
    )
  })) || [];

  const renderChart = (title: string, description: string, keys: ConsumptionKeys[], showToggles = false) => {
    const formatter = getChartFormatter(keys);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{fill: '#fff'}}
                  stroke="#fff"
                  tickLine={{stroke: '#fff'}}
                  axisLine={{stroke: '#fff'}}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{fill: '#fff'}}
                  stroke="#fff"
                  tickLine={{stroke: '#fff'}}
                  axisLine={{stroke: '#fff'}}
                  label={
                    formatter.yAxisUnitLabel
                      ? {
                        value: formatter.yAxisUnitLabel,
                        angle: -90,
                        position: 'insideLeft',
                        fill: '#fff',
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
        cumulativePowerConsumption
      )}
      {renderChart(
        'Cumulative Power Yield',
        `Total energy yield over time (${historyData?.length || 0} data points)`,
        cumulativePowerYield
      )}
      {renderChart(
        'Power Details',
        `Detailed power usage, current, and voltage per phase (${historyData?.length || 0} data points)`,
        powerKeys,
        true
      )}
      {renderChart(
        'Voltage Details',
        `Detailed voltage per phase (${historyData?.length || 0} data points)`,
        voltageKeys
      )}
      {renderChart(
        'Current Details',
        `Detailed current per phase (${historyData?.length || 0} data points)`,
        currentKeys
      )}
    </div>
  );
}