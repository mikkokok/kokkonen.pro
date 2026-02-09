import {useEffect, useMemo, useState} from "react";
import {backendUrl} from "../../config/config";
import {ElectricityClient} from "../../lib/electricity/electricityClient";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {Checkbox} from '../ui/checkbox';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

import {ConsumptionData, ConsumptionKeys, translateKey, validConsumptionKeys} from "../../lib/electricity/validation/consumptionData";
export function ElectricityDetails() {
  const electricityClient = useMemo(() => new ElectricityClient(backendUrl), []);
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(
    Object.fromEntries(validConsumptionKeys.map(key => [key, true]))
  );
  const [historyData, setHistoryData] = useState<ConsumptionData[] | undefined>(undefined);
  const cumulativePowerConsumption: ConsumptionKeys[] = ['CumulativePowerConsumption'];
  const cumulativePowerYield: ConsumptionKeys[] = ['CumulativePowerYield'];
  const voltageKeys: ConsumptionKeys[] = ['L1Voltage', 'L2Voltage', 'L3Voltage'];
  const currentKeys: ConsumptionKeys[] = ['L1InstantPowerCurrent', 'L2InstantPowerCurrent', 'L3InstantPowerCurrent'];
  const otherKeys: ConsumptionKeys[] = validConsumptionKeys.filter(
    key => key !== 'CumulativePowerConsumption' && key !== 'CumulativePowerYield' && !voltageKeys.includes(key)
  );
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
    const isCumulativeChart = keys.some(key => key.includes('Cumulative'));

    if (isVoltageChart) {
      return {
        domain: [220, 240] as [number, number],
        tickFormatter: (value: number) => `${value.toFixed(0)}V`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} V`
      };
    }
    if (isCurrentChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        tickFormatter: (value: number) => `${value.toFixed(1)}A`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} A`
      };
    }
    if (isCumulativeChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        tickFormatter: (value: number) => `${value.toFixed(0)}kWh`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} kWh`
      };
    }
    return {
      domain: ['auto', 'auto'] as ['auto', 'auto'],
      tickFormatter: undefined,
      tooltipFormatter: (value: number) => `${value.toFixed(2)}`
    };
  };

  const toggleLine = (key: ConsumptionKeys) => {
    setVisibleLines(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const chartData = historyData?.map((record) => ({
    timestamp: new Date(record.timestamp).toLocaleString('fi-FI', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
          {showToggles && (
            <div className="mb-4 flex flex-wrap gap-4">
              {keys.map((key) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`toggle-${key}`}
                    checked={visibleLines[key]}
                    onCheckedChange={() => toggleLine(key)}
                  />
                  <label
                    htmlFor={`toggle-${key}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {translateKey(key)}
                  </label>
                </div>
              ))}
            </div>
          )}
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{fill: 'hsl(var(--muted-foreground))'}}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{fill: 'hsl(var(--muted-foreground))'}}
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
                  visibleLines[key] && (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={translateKey(key)}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{r: 4}}
                    />
                  )
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
        otherKeys,
        true
      )}
      {renderChart(
        'Voltage Details',
        `Detailed voltage per phase (${historyData?.length || 0} data points)`,
        voltageKeys
      )}
    </div>
  );
}