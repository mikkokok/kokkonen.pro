import {HubConnection} from '@microsoft/signalr';
import {useEffect, useMemo, useRef, useState} from 'react';
import {backendUrl} from '../../config/config';
import {
  ConsumptionData,
  consumptionDataSchema,
  ConsumptionKeys,
  translateKey,
  translateUnit,
  validConsumptionKeys,
} from '../../lib/electricity/validation/consumptionData';
import {formatConsumptionReading, scaleConsumptionValue} from '../../lib/electricity/consumptionDisplay';
import {ElectricityClient} from '../../lib/electricity/electricityClient';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Badge} from '../ui/badge';
import {Checkbox} from '../ui/checkbox';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush} from 'recharts';
import {convertMQStatusEnumToString} from '../../lib/electricity/validation/mqResponse';
import {useMsal} from '@azure/msal-react';
import {InteractionStatus} from '@azure/msal-browser';
import {formatDateFi, formatDateTimeFi, formatTimeFi} from '../../lib/dateTimeFormat';
import {devLog} from '../../lib/logger';
import {
  buildDownsampledTimeSeriesChartData,
  createTimeAxisAndTooltipFormatters,
  TimeSeriesChartPoint,
} from '../../lib/charts/timeSeriesChart';

const actualKeys: ConsumptionKeys[] = ['ActualConsumption', 'ActualReturndelivery'];
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d884d8', '#ca9d82', '#58c6ff'];

function ElectricityConsumption() {
  const connection = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [latestConsumptionData, setLatestConsumptionData] = useState<ConsumptionData | null>(null);
  const [historyData, setHistoryData] = useState<ConsumptionData[] | null>(null);

  const [mqStatus, setMqStatus] = useState<string | null>(null);
  const [mqStatusUpdatedAt, setMqStatusUpdatedAt] = useState<string | null>(null);

  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(
    Object.fromEntries(validConsumptionKeys.map((key) => [key, true]))
  );

  const {accounts, inProgress} = useMsal();
  const electricityClient = useMemo(() => new ElectricityClient(backendUrl), []);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    const currentConnection = connection.current;
    const connectionUrl = `${backendUrl}api/electricity/consumption`;

    if (!currentConnection) {
      setConnectionStatus(`Connecting to ${connectionUrl}`);

      const setupConnection = async () => {
        try {
          const hubConnection = await electricityClient.getElectricityHubConnection();

          hubConnection.on('broadcastConsumptionData', (data: ConsumptionData) => {
            try {
              const validatedData = consumptionDataSchema.parse(data);
              setLatestConsumptionData(validatedData);
            } catch (error) {
              devLog('error in validation', error);
              setLatestConsumptionData(null);
            }
          });

          await hubConnection.start();
          devLog('hubConnection started');
          setConnectionStatus(`Connected to ${connectionUrl}`);
          connection.current = hubConnection;
        } catch (error) {
          devLog('hubConnection failed', error);
          setConnectionStatus(`Connection failed to ${connectionUrl}, due to ${error}`);
        }
      };

      void setupConnection();
    }

    return () => {
      if (currentConnection) {
        void currentConnection.stop();
      }
    };
  }, [accounts.length, inProgress, electricityClient]);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    const fetchMqStatus = async () => {
      try {
        const status = await electricityClient.getMQStatus();
        setMqStatus(convertMQStatusEnumToString(status));
        setMqStatusUpdatedAt(formatDateTimeFi(new Date()));
      } catch (error) {
        devLog('Failed to fetch MQ status', error);
        setMqStatus(null);
        setMqStatusUpdatedAt(formatDateTimeFi(new Date()));
      }
    };

    void fetchMqStatus();

    const intervalId = setInterval(() => {
      void fetchMqStatus();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [accounts.length, inProgress, electricityClient]);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    const fetchHistoryData = async () => {
      try {
        const fetchedHistoryData = await electricityClient.getHistoryData();
        setHistoryData(fetchedHistoryData);
      } catch (error) {
        devLog('Failed to fetch history data', error);
      }
    };

    void fetchHistoryData();

    const intervalId = setInterval(() => {
      void fetchHistoryData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [accounts.length, inProgress, electricityClient]);

  if (inProgress !== InteractionStatus.None) {
    return (
      <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
        <p className="text-sm text-muted-foreground">Initializing authentication...</p>
      </div>
    );
  }

  const getStatusVariant = () => {
    if (connectionStatus.includes('Connected')) return 'default';
    if (connectionStatus.includes('Connecting')) return 'secondary';
    return 'destructive';
  };

  const getMqStatusVariant = () => {
    const s = mqStatus === null ? '' : String(mqStatus).toLowerCase();
    if (!s) return 'secondary';
    if (s.includes('ok') || s.includes('healthy') || s.includes('connected') || s.includes('running') || s.includes('up'))
      return 'default';
    return 'destructive';
  };

  const actualChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, actualKeys, {
        keyToLabel: translateKey,
        scaleValue: scaleConsumptionValue,
      }),
    [historyData]
  );

  const dailyTotals = useMemo(() => {
    if (!historyData || historyData.length === 0) return [];

    const sorted = [...historyData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

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
      if (Number.isNaN(ts.getTime())) continue;

      const dayKey = formatDateFi(ts);
      if (!dayKey || dayKey === '—') continue;

      const cumulativeConsumptionWh = point.data.CumulativePowerConsumption;
      const cumulativeYieldWh = point.data.CumulativePowerYield;
      if (cumulativeConsumptionWh === undefined || cumulativeYieldWh === undefined) continue;

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
      .map(([date, v]) => {
        const usedWh = Math.max(0, v.lastConsumptionWh - v.firstConsumptionWh);
        const yieldWh = Math.max(0, v.lastYieldWh - v.firstYieldWh);

        return {
          date,
          sortTs: v.sortTs,
          usedKWh: scaleConsumptionValue('CumulativePowerConsumption', usedWh),
          yieldKWh: scaleConsumptionValue('CumulativePowerYield', yieldWh),
        };
      })
      .sort((a, b) => b.sortTs - a.sortTs);
  }, [historyData]);

  const getChartFormatter = (keys: ConsumptionKeys[]) => {
    const unitLabel = keys.length > 0 ? translateUnit(keys[0]) : '';

    return {
      domain: ['auto', 'auto'] as ['auto', 'auto'],
      yAxisUnitLabel: unitLabel,
      tickFormatter: undefined,
      tooltipFormatter: (value: number) => `${value.toFixed(2)}`,
    };
  };

  const toggleLine = (key: ConsumptionKeys) => {
    setVisibleLines((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderChart = (
    title: string,
    description: string,
    keys: ConsumptionKeys[],
    chartData: TimeSeriesChartPoint[],
    showToggles = false
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
              <LineChart data={chartData} margin={{top: 10, right: 20, left: 10, bottom: 80}}>
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
                  minTickGap={50}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                <YAxis
                  className="text-xs"
                  tick={{fill: axisColor}}
                  stroke={axisColor}
                  tickLine={{stroke: axisColor}}
                  axisLine={{stroke: axisColor}}
                  width={60}
                  domain={formatter.domain}
                  tickFormatter={
                    formatter.yAxisUnitLabel
                      ? (v: number) => `${v.toFixed(1)} ${formatter.yAxisUnitLabel}`
                      : undefined
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                  }}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                  formatter={(value: number | undefined) =>
                    value !== undefined ? formatter.tooltipFormatter(value) : 'N/A'
                  }
                  labelFormatter={formatTooltipLabel}
                />
                <Legend wrapperStyle={{paddingTop: '8px', fontSize: '12px'}} />
                <Brush dataKey="ts" height={30} stroke="hsl(var(--border))" fill="hsl(var(--muted))/0.3" travellerWidth={8} />
                {keys.map((key, index) =>
                  visibleLines[key] ? (
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
                  ) : null
                )}
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
        <h1 className="text-3xl font-bold tracking-tight">Electricity Consumption</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStatusVariant()} className="text-sm">
            {connectionStatus}
          </Badge>

          <Badge variant={getMqStatusVariant()} className="text-sm">
            MQ: {mqStatus === null ? 'Unknown' : String(mqStatus)}
            {mqStatusUpdatedAt ? ` (updated ${mqStatusUpdatedAt})` : ''}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Reading</CardTitle>
          <CardDescription>
            Last updated: {latestConsumptionData ? formatDateTimeFi(latestConsumptionData.timestamp) : 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestConsumptionData ? (
            <div className="space-y-3">
              {validConsumptionKeys.map((key) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <span className="text-sm font-medium">{translateKey(key)}</span>
                  <span className="text-sm text-muted-foreground">
                    {formatConsumptionReading(key, latestConsumptionData.data[key])}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for data...</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily energy totals</CardTitle>
          <CardDescription>Energy used and yielded per day (kWh), calculated from cumulative counters</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyTotals.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="text-left font-medium py-2 pr-4 whitespace-nowrap">
                      Date
                    </th>
                    <th scope="col" className="text-right font-medium py-2 pr-4 whitespace-nowrap">
                      Used (kWh)
                    </th>
                    <th scope="col" className="text-right font-medium py-2 whitespace-nowrap">
                      Yield (kWh)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyTotals.slice(0, 14).map((row) => (
                    <tr key={row.date} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{row.date}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.usedKWh.toFixed(2)}</td>
                      <td className="py-2 text-right tabular-nums">{row.yieldKWh.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Loading history data...</p>
          )}
        </CardContent>
      </Card>

      {renderChart(
        'Actual Consumption & Return Delivery',
        `Current power usage and return delivery (${historyData?.length || 0} data points)`,
        actualKeys,
        actualChartData
      )}
    </div>
  );
}

export default ElectricityConsumption;
