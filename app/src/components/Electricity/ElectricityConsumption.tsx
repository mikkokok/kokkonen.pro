import {useMemo, useState} from 'react';
import {
  ConsumptionKeys,
  translateKey,
  translateUnit,
} from '../../lib/electricity/validation/consumptionData';
import {scaleConsumptionValue} from '../../lib/electricity/consumptionDisplay';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Checkbox} from '../ui/checkbox';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Brush} from 'recharts';
import {formatDateFi, formatDateTimeFi, formatTimeFi} from '../../lib/dateTimeFormat';
import {
  buildDownsampledTimeSeriesChartData,
  createTimeAxisAndTooltipFormatters,
  TimeSeriesChartPoint,
} from '../../lib/charts/timeSeriesChart';
import {buildDailyEnergyTotals} from '../../lib/electricity/dailyTotals';
import {
  ENERGY_TAX_1_EUR_PER_KWH,
  ENERGY_TAX_2_EUR_PER_KWH,
  MARGIN_EUR_PER_KWH,
  spotPriceAt,
  TRANSFER_EUR_PER_KWH,
  USED_ADDITIONAL_EUR_PER_KWH,
  usedPriceEurPerKWh,
  YIELD_FEE_EUR_PER_KWH,
  yieldPriceEurPerKWh,
} from '../../lib/electricity/pricing';
import {useAppSelector} from '../../store/hooks';

const actualKeys: ConsumptionKeys[] = ['ActualConsumption', 'ActualReturndelivery'];
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d884d8', '#ca9d82', '#58c6ff'];

function ElectricityConsumption() {
  const {historyData, historyLoading, spotPriceByInterval} = useAppSelector((state) => state.electricity);

  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(
    Object.fromEntries(actualKeys.map((key) => [key, true]))
  );

  const actualChartData = useMemo(
    () =>
      buildDownsampledTimeSeriesChartData(historyData, actualKeys, {
        keyToLabel: translateKey,
        scaleValue: scaleConsumptionValue,
      }),
    [historyData]
  );

  const dailyTotals = useMemo(() => buildDailyEnergyTotals(historyData), [historyData]);

  const dailyValueByDay = useMemo(() => {
    const map = new Map<
      string,
      {
        usedPricedKWh: number;
        usedUnpricedKWh: number;
        usedCostEur: number;
        yieldPricedKWh: number;
        yieldUnpricedKWh: number;
        yieldProvidedEur: number;
      }
    >();

    if (!historyData || historyData.length < 2) {
      return map;
    }

    const sorted = [...historyData].sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const upsert = (
      day: string,
      update: (value: {
        usedPricedKWh: number;
        usedUnpricedKWh: number;
        usedCostEur: number;
        yieldPricedKWh: number;
        yieldUnpricedKWh: number;
        yieldProvidedEur: number;
      }) => void
    ) => {
      const current = map.get(day) ?? {
        usedPricedKWh: 0,
        usedUnpricedKWh: 0,
        usedCostEur: 0,
        yieldPricedKWh: 0,
        yieldUnpricedKWh: 0,
        yieldProvidedEur: 0,
      };
      update(current);
      map.set(day, current);
    };

    for (let i = 1; i < sorted.length; i += 1) {
      const previous = sorted[i - 1];
      const current = sorted[i];

      const previousUsedWh = previous.data.CumulativePowerConsumption;
      const currentUsedWh = current.data.CumulativePowerConsumption;
      const previousYieldWh = previous.data.CumulativePowerYield;
      const currentYieldWh = current.data.CumulativePowerYield;

      const currentTs = new Date(current.timestamp);
      if (Number.isNaN(currentTs.getTime())) {
        continue;
      }

      const dayKey = formatDateFi(currentTs);
      const spotPrice = spotPriceAt(spotPriceByInterval, currentTs);

      if (previousUsedWh !== undefined && currentUsedWh !== undefined) {
        const usedDeltaWh = Math.max(0, currentUsedWh - previousUsedWh);
        if (usedDeltaWh > 0) {
          const usedDeltaKWh = scaleConsumptionValue('CumulativePowerConsumption', usedDeltaWh);

          if (spotPrice === undefined) {
            upsert(dayKey, (value) => {
              value.usedUnpricedKWh += usedDeltaKWh;
            });
          } else {
            const usedEurPerKWh = usedPriceEurPerKWh(spotPrice);
            upsert(dayKey, (value) => {
              value.usedPricedKWh += usedDeltaKWh;
              value.usedCostEur += usedDeltaKWh * usedEurPerKWh;
            });
          }
        }
      }

      if (previousYieldWh !== undefined && currentYieldWh !== undefined) {
        const yieldDeltaWh = Math.max(0, currentYieldWh - previousYieldWh);
        if (yieldDeltaWh > 0) {
          const yieldDeltaKWh = scaleConsumptionValue('CumulativePowerYield', yieldDeltaWh);

          if (spotPrice === undefined) {
            upsert(dayKey, (value) => {
              value.yieldUnpricedKWh += yieldDeltaKWh;
            });
          } else {
            const payoutEurPerKWh = yieldPriceEurPerKWh(spotPrice);
            upsert(dayKey, (value) => {
              value.yieldPricedKWh += yieldDeltaKWh;
              value.yieldProvidedEur += yieldDeltaKWh * payoutEurPerKWh;
            });
          }
        }
      }
    }

    return map;
  }, [historyData, spotPriceByInterval]);

  const dailyMoneyRows = useMemo(
    () =>
      dailyTotals.map((row) => {
        const dayValues = dailyValueByDay.get(row.date);
        const usedCostEur = dayValues?.usedCostEur ?? 0;
        const usedPricedKWh = dayValues?.usedPricedKWh ?? 0;
        const usedUnpricedKWh = dayValues?.usedUnpricedKWh ?? row.usedKWh;
        const yieldProvidedEur = dayValues?.yieldProvidedEur ?? 0;
        const yieldPricedKWh = dayValues?.yieldPricedKWh ?? 0;
        const yieldUnpricedKWh = dayValues?.yieldUnpricedKWh ?? row.yieldKWh;

        return {
          ...row,
          usedCostEur,
          usedPricedKWh,
          usedUnpricedKWh,
          yieldProvidedEur,
          yieldPricedKWh,
          yieldUnpricedKWh,
          netCostEur: usedCostEur - yieldProvidedEur,
        };
      }),
    [dailyTotals, dailyValueByDay]
  );

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily energy totals</CardTitle>
          <CardDescription>
            Energy used and yielded per day (kWh), calculated from cumulative counters
          </CardDescription>
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
          ) : historyLoading ? (
            <p className="text-sm text-muted-foreground">Waiting for data...</p>
          ) : (
            <p className="text-sm text-muted-foreground">No history data available.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daily electricity value</CardTitle>
          <CardDescription>
            Daily energy converted to EUR using configured used-energy taxes and yield payout from spot price minus fee.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-medium mb-2">Used electricity rates (EUR/kWh)</div>
              <div className="flex justify-between"><span>Cost formula</span><span>spot price + additions</span></div>
              <div className="flex justify-between"><span>Transfer</span><span>{TRANSFER_EUR_PER_KWH.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Energy tax 1</span><span>{ENERGY_TAX_1_EUR_PER_KWH.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Energy tax 2</span><span>{ENERGY_TAX_2_EUR_PER_KWH.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>Margin</span><span>{MARGIN_EUR_PER_KWH.toFixed(4)}</span></div>
              <div className="mt-2 pt-2 border-t border-border flex justify-between font-medium">
                <span>Total additions</span>
                <span>{USED_ADDITIONAL_EUR_PER_KWH.toFixed(6)}</span>
              </div>
            </div>
            <div className="rounded-lg border p-3 text-sm">
              <div className="font-medium mb-2">Yield model (EUR/kWh)</div>
              <div className="flex justify-between"><span>Payout formula</span><span>spot price - fee</span></div>
              <div className="flex justify-between"><span>Yield fee</span><span>{YIELD_FEE_EUR_PER_KWH.toFixed(3)}</span></div>
            </div>
          </div>

          {dailyMoneyRows.length > 0 ? (
            <div className="w-full overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th scope="col" className="text-left font-medium py-2 pr-4 whitespace-nowrap">
                      Date
                    </th>
                    <th scope="col" className="text-right font-medium py-2 pr-4 whitespace-nowrap">
                      Used cost (EUR)
                    </th>
                    <th scope="col" className="text-right font-medium py-2 pr-4 whitespace-nowrap">
                      Used priced/unpriced (kWh)
                    </th>
                    <th scope="col" className="text-right font-medium py-2 pr-4 whitespace-nowrap">
                      Yield provided (EUR)
                    </th>
                    <th scope="col" className="text-right font-medium py-2 pr-4 whitespace-nowrap">
                      Yield priced/unpriced (kWh)
                    </th>
                    <th scope="col" className="text-right font-medium py-2 whitespace-nowrap">
                      Net cost (EUR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dailyMoneyRows.slice(0, 14).map((row) => (
                    <tr key={row.date} className="border-b border-border last:border-0">
                      <td className="py-2 pr-4 whitespace-nowrap">{row.date}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.usedCostEur.toFixed(2)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {row.usedPricedKWh.toFixed(2)} / {row.usedUnpricedKWh.toFixed(2)}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">{row.yieldProvidedEur.toFixed(2)}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {row.yieldPricedKWh.toFixed(2)} / {row.yieldUnpricedKWh.toFixed(2)}
                      </td>
                      <td className="py-2 text-right tabular-nums">{row.netCostEur.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : historyLoading ? (
            <p className="text-sm text-muted-foreground">Loading history data...</p>
          ) : (
            <p className="text-sm text-muted-foreground">No history data available.</p>
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
