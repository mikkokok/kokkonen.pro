import {Card, CardContent, CardHeader, CardTitle} from "./ui/card";
import {useEffect, useMemo, useState} from "react";
import {backendUrl} from "../config/config";
import {HeatHarmonyClient} from "../lib/heatHarmony/heatHarmonyClient";
import {OumanLatestResponse} from "../lib/heatHarmony/validation/oumanLatestResponse";
import {ElectricHome01Icon, TemperatureIcon} from "@hugeicons/core-free-icons";
import {HugeiconsIcon} from '@hugeicons/react';
import {useCallback} from "react";
import {useMsal} from "@azure/msal-react";
import {InteractionStatus} from "@azure/msal-browser";
import {useAppSelector} from "../store/hooks";
import {spotPriceAt, usedPriceEurPerKWh, yieldPriceEurPerKWh} from "../lib/electricity/pricing";
import {formatTimeFi} from "../lib/dateTimeFormat";

const PRICE_PERIOD_HOURS = 0.25;

function Home() {
  const {instance, accounts, inProgress} = useMsal();
  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);
  const [oumanLatest, setOumanLatest] = useState<OumanLatestResponse | undefined>(undefined);
  const latestConsumption = useAppSelector((state) => state.electricity.latestConsumptionData);
  const spotPriceByInterval = useAppSelector((state) => state.electricity.spotPriceByInterval);
  const spotPriceLoading = useAppSelector((state) => state.electricity.spotPriceLoading);
  const spotPriceError = useAppSelector((state) => state.electricity.spotPriceError);

  const electricityNow = useMemo(() => {
    if (!latestConsumption) return null;

    const timestamp = new Date(latestConsumption.timestamp);
    const spotPrice = Number.isNaN(timestamp.getTime()) ? undefined : spotPriceAt(spotPriceByInterval, timestamp);
    const consumptionKW = (latestConsumption.data.ActualConsumption ?? 0) / 1000;
    const returnKW = (latestConsumption.data.ActualReturndelivery ?? 0) / 1000;

    if (spotPrice === undefined) {
      return {timestamp, consumptionKW, returnKW, spotPrice, usedPrice: undefined, periodCostEur: undefined};
    }

    const usedPrice = usedPriceEurPerKWh(spotPrice);
    const periodCostEur =
      (consumptionKW * usedPrice - returnKW * yieldPriceEurPerKWh(spotPrice)) * PRICE_PERIOD_HOURS;
    return {timestamp, consumptionKW, returnKW, spotPrice, usedPrice, periodCostEur};
  }, [latestConsumption, spotPriceByInterval]);

  const fetchData = useCallback(async () => {
    try {
      const oumanLatestData = await heatHarmonyClient.getOumanLatestData();
      setOumanLatest(oumanLatestData);
    } catch (error) {
      console.error("Error fetching latest data:", error);
    }
  }, [heatHarmonyClient]);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  if (inProgress !== InteractionStatus.None) {
    return <div>Loading...</div>;
  }

  const account = instance.getActiveAccount() ?? accounts[0] ?? null;

  return (
    <div className="p-6 space-y-6 dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Welcome back, {account?.name || account?.username || '—'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your home today.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outside Temp</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanLatest?.outsideTemp?.toFixed(1)}°C</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inside Temp</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanLatest?.insideTemp?.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">
              Target: {oumanLatest?.insideTempDemand?.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Electricity now</CardTitle>
            <HugeiconsIcon icon={ElectricHome01Icon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {electricityNow ? (
              <>
                <div className="text-2xl font-bold">
                  {electricityNow.returnKW > electricityNow.consumptionKW
                    ? `−${electricityNow.returnKW.toFixed(2)} kW`
                    : `${electricityNow.consumptionKW.toFixed(2)} kW`}
                  {electricityNow.periodCostEur !== undefined && (
                    <span className="text-base font-medium text-muted-foreground">
                      {' '}/ {(electricityNow.periodCostEur * 100).toFixed(2)} c per 15 min
                    </span>
                  )}
                </div>
                {(electricityNow.usedPrice === undefined ||
                  electricityNow.periodCostEur === undefined ||
                  electricityNow.spotPrice === undefined) && (
                    <p className="text-xs text-muted-foreground">
                      {spotPriceError
                        ? `Spot price fetch failed: ${spotPriceError}`
                        : spotPriceLoading
                          ? 'Loading spot price...'
                          : `No spot price for ${formatTimeFi(electricityNow.timestamp, {minute: undefined})}`}
                    </p>
                  )}
                {electricityNow.usedPrice !== undefined && electricityNow.spotPrice !== undefined && (
                  <p className="text-xs text-muted-foreground">
                    Price {(electricityNow.usedPrice * 100).toFixed(2)} c/kWh (spot {(electricityNow.spotPrice * 100).toFixed(2)} + fees{' '}
                    {((electricityNow.usedPrice - electricityNow.spotPrice) * 100).toFixed(2)})
                  </p>
                )}
                <p className="text-xs text-muted-foreground">Updated {formatTimeFi(electricityNow.timestamp)}</p>
              </>
            ) : (
              <div className="text-sm text-muted-foreground">Waiting for data...</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Home;
