import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "../ui/card";
import {backendUrl} from "../../config/config";
import {HeatHarmonyClient} from "../../lib/heatHarmony/heatHarmonyClient";
import {useCallback, useEffect, useMemo, useState} from "react";
import {Separator} from "../ui/separator";
import {PricesResponse} from "../../lib/heatHarmony/validation/pricesResponse";
import {NightPeriod, TodayLowPricePeriodsResponse} from "../../lib/heatHarmony/validation/lowPricePeriods";
import {formatDateTimeFi} from "../../lib/dateTimeFormat";

export default function ElectricityPrices() {
  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);
  const [todayPrices, setTodayPrices] = useState<PricesResponse | undefined>(undefined);
  const [tomorrowPrices, setTomorrowPrices] = useState<PricesResponse | undefined>(undefined);
  const [nightPeriod, setNightPeriod] = useState<NightPeriod | undefined>(undefined);
  const [todayLowPricePeriods, setTodayLowPricePeriods] = useState<TodayLowPricePeriodsResponse | undefined>(undefined);
  const [allLowPricePeriods, setAllLowPricePeriods] = useState<TodayLowPricePeriodsResponse | undefined>(undefined);

  const formatPrice = (value: number | string | null | undefined) => {
    if (value === null || value === undefined) return '—';
    const parsed = typeof value === 'number' ? value : Number.parseFloat(value);
    if (Number.isNaN(parsed)) return String(value);
    return parsed.toFixed(3);
  };

  const fetchData = useCallback(async () => {
    try {
      const todayElectricityPrices = await heatHarmonyClient.getTodayElectricityPrices();
      setTodayPrices(todayElectricityPrices);
      const tomorrowElectricityPrices = await heatHarmonyClient.getTomorrowElectricityPrices();
      setTomorrowPrices(tomorrowElectricityPrices);
      const nightPeriodElectricityPrices = await heatHarmonyClient.getNightPeriodElectricityPrices();
      setNightPeriod(nightPeriodElectricityPrices);
      const todaysLowPricePeriods = await heatHarmonyClient.getTodaysLowPricePeriods();
      setTodayLowPricePeriods(todaysLowPricePeriods);
      const allLowPricePeriods = await heatHarmonyClient.getAllLowPricePeriods();
      setAllLowPricePeriods(allLowPricePeriods);
    } catch (error) {
      console.error("Error fetching electricity prices:", error);
    }
  }, [heatHarmonyClient]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const formatDateHour = (dateString: string, hour: number) => {
    const base = new Date(dateString);
    if (Number.isNaN(base.getTime())) return dateString;
    const withHour = new Date(base);
    withHour.setHours(hour, base.getMinutes(), 0, 0);
    return formatDateTimeFi(withHour, {second: undefined});
  };


  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Electricity prices</h1>

      </div>
      <Card>
        <CardHeader>
          <CardTitle>Electricity Prices</CardTitle>
          <CardDescription>Today, tomorrow and selected night period</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Night period</span>
            </div>
            <div className="grid gap-2 md:grid-cols-3">
              <div className="text-sm">
                <span className="text-muted-foreground">Start:</span> {formatDateTimeFi(nightPeriod?.period?.start, {second: undefined})}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">End:</span> {formatDateTimeFi(nightPeriod?.period?.end, {second: undefined})}
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Avg:</span> {formatPrice(nightPeriod?.period?.averagePrice)}
              </div>
            </div>
          </div>

          <Separator />

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Today's low price periods</span>
            </div>
            <div className="space-y-1">
              {(todayLowPricePeriods?.periods ?? []).map((p) => (
                <div key={`${p.start}-${p.end}-${p.rank}`} className="grid gap-2 md:grid-cols-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Start:</span> {formatDateTimeFi(p.start, {second: undefined})}
                  </div>
                  <div>
                    <span className="text-muted-foreground">End:</span> {formatDateTimeFi(p.end, {second: undefined})}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg:</span> {formatPrice(p.averagePrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="rounded-lg border p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">All low price periods</span>
              <span className="text-xs text-muted-foreground">{allLowPricePeriods?.periods.length ?? 0} rows</span>
            </div>
            <div className="space-y-1">
              {(allLowPricePeriods?.periods ?? []).map((p) => (
                <div key={`${p.start}-${p.end}-${p.rank}`} className="grid gap-2 md:grid-cols-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Rank:</span> {p.rank}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Start:</span> {formatDateTimeFi(p.start, {second: undefined})}
                  </div>
                  <div>
                    <span className="text-muted-foreground">End:</span> {formatDateTimeFi(p.end, {second: undefined})}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Avg:</span> {formatPrice(p.averagePrice)}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Separator />

          <div className="grid gap-2 md:grid-cols-2">
            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Today</span>
                <span className="text-xs text-muted-foreground">{todayPrices?.prices?.length ?? 0} rows</span>
              </div>
              <div className="space-y-1">
                {(todayPrices?.prices ?? []).map((p) => (
                  <div key={`${p.date}-${p.hour}`} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{formatDateHour(p.date, p.hour)}</span>
                    <span>{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tomorrow</span>
                <span className="text-xs text-muted-foreground">{tomorrowPrices?.prices?.length ?? 0} rows</span>
              </div>
              <div className="space-y-1">
                {(tomorrowPrices?.prices ?? []).map((p) => (
                  <div key={`${p.date}-${p.hour}`} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{formatDateHour(p.date, p.hour)}</span>
                    <span>{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  )
}