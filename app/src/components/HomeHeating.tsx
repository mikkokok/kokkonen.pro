import {useCallback, useEffect, useMemo, useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {Button} from './ui/button';
import {Input} from './ui/input';
import {Label} from './ui/label';
import {Badge} from './ui/badge';
import {Separator} from './ui/separator';
import {
  AlertCircleIcon,
  CheckmarkCircle02Icon,
  FireIcon,
  TemperatureIcon,
  DropletIcon,
  BatteryFullIcon,
} from '@hugeicons/core-free-icons';
import {HugeiconsIcon} from '@hugeicons/react';
import {backendUrl} from '../config/config';
import {HeatHarmonyClient} from '../lib/heatHarmony/heatHarmonyClient';
import {PingResponse} from '../lib/heatHarmony/validation/pingStatus';
import {HeatAutomationStatusResponse} from '../lib/heatHarmony/validation/heatAutomationStatus';
import {HeatAutomationOverrideStatusResponse} from '../lib/heatHarmony/validation/heatAutomationOverrideStatusResponse';
import {HeishamonLatestResponse} from '../lib/heatHarmony/validation/heishamonLatestResponse';
import {HeishamonStatusResponse} from '../lib/heatHarmony/validation/heishamonStatusResponse';
import {OumanLatestResponse} from '../lib/heatHarmony/validation/oumanLatestResponse';
import {OumanStatusResponse} from '../lib/heatHarmony/validation/oumanStatusResponse';
import {TrvLatestResponse} from '../lib/heatHarmony/validation/trvLatestResponse';
import {HeatAutomationOverrideRequest} from '../lib/heatHarmony/types/heatAutomationOverrideRequest';
import {OilburnerLatestResponse} from '../lib/heatHarmony/validation/oilburnerLatestResponse';
import {convertHarmonyChangeEnumToString} from '../lib/heatHarmony/validation/harmonyChange';
import {EMOverrideStatusResponse} from '../lib/heatHarmony/validation/eMOverrideStatusResponse';
import {EMOverrideMode} from '../lib/heatHarmony/types/emOverrrideMode';
import {EMLatestResponse} from '../lib/heatHarmony/validation/eMLatestResponse';
import {UptimeResponse} from '../lib/heatHarmony/validation/uptimeResponse';
import {EmChangesResponse} from '../lib/heatHarmony/validation/emChangesResponse';
import {OilBurnerChangesResponse} from '../lib/heatHarmony/validation/oilBurnerChangesResponse';
import {Pro3StatusResponse} from '../lib/heatHarmony/validation/pro3StatusResponse';
import {Pro3OverrideStatusResponse} from '../lib/heatHarmony/validation/pro3OverrideStatusResponse';
import {SelectedTempsResponse} from '../lib/heatHarmony/validation/selectedTempsResponse';
import {Checkbox} from './ui/checkbox';
import {formatDateTimeFi} from '../lib/dateTimeFormat';

export function HomeHeating() {
  const [loading, setLoading] = useState(false);
  const [heatAutomationPingStatus, setHeatAutomationPingStatus] = useState<PingResponse>({status: null, serverTime: undefined});
  const [heatAutomationStatus, setHeatAutomationStatus] = useState<HeatAutomationStatusResponse | undefined>(undefined);
  const [overrideStatus, setOverrideStatus] = useState<HeatAutomationOverrideStatusResponse | undefined>(undefined);

  const [overrideTemp, setOverrideTemp] = useState<number>(21);
  const [overrideHours, setOverrideHours] = useState<number>(2);
  const [overrideDelay, setOverrideDelay] = useState<number>(0);
  const [overrideOverridePrevious, setOverrideOverridePrevious] = useState<boolean>(true);

  const [oumanLatest, setOumanLatest] = useState<OumanLatestResponse | undefined>(undefined);
  const [oumanStatus, setOumanStatus] = useState<OumanStatusResponse | undefined>(undefined);

  const [heishamonLatest, setHeishamonLatest] = useState<HeishamonLatestResponse | undefined>(undefined);
  const [heishamonStatus, setHeishamonStatus] = useState<HeishamonStatusResponse | undefined>(undefined);

  const [trvLatest, setTrvLatest] = useState<TrvLatestResponse | undefined>(undefined);
  const [oilburnerLatest, setOilburnerLatest] = useState<OilburnerLatestResponse | undefined>(undefined);
  const [enableUseWaterHeaterData, setEnableUseWaterHeaterData] = useState<EMOverrideStatusResponse | undefined>(undefined);
  const [useWaterHeaterLatest, setUseWaterHeaterLatest] = useState<EMLatestResponse | undefined>(undefined);
  const [useWaterOverrideHours, setUseWaterOverrideHours] = useState<number>(2);

  const [uptime, setUptime] = useState<UptimeResponse | undefined>(undefined);
  const [avgTempLast2Days, setAvgTempLast2Days] = useState<number | undefined>(undefined);
  const [emChanges, setEmChanges] = useState<EmChangesResponse | undefined>(undefined);
  const [oilBurnerChanges, setOilBurnerChanges] = useState<OilBurnerChangesResponse | undefined>(undefined);
  const [pro3Status, setPro3Status] = useState<Pro3StatusResponse[] | undefined>(undefined);
  const [pro3OverrideStatus, setPro3OverrideStatus] = useState<Pro3OverrideStatusResponse | undefined>(undefined);
  const [pro3OutputAmount, setPro3OutputAmount] = useState<number>(1);
  const [pro3Output, setPro3Output] = useState<boolean>(true);
  const [pro3DurationMinutes, setPro3DurationMinutes] = useState<number>(60);
  const [selectedTemps, setSelectedTemps] = useState<SelectedTempsResponse | undefined>(undefined);
  const [actionStatus, setActionStatus] = useState<{type: 'success' | 'error'; message: string} | undefined>(undefined);

  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);

  const fetchData = useCallback(async () => {
    try {
      const safe = async <T,>(label: string, request: Promise<T>): Promise<T | undefined> => {
        try {
          return await request;
        } catch (error) {
          console.warn(`HeatHarmony fetch failed (${label}):`, error);
          return undefined;
        }
      };

      const [
        ping,
        automationStatus,
        automationOverrideStatus,
        oumanLatestData,
        oumanStatusData,
        heishamonLatestData,
        heishamonStatusData,
        trvLatestData,
        oilburnerLatestData,
        useWaterHeaterLatestData,
        useWaterHeaterOverrideStatus,
        uptimeData,
        restlessFalconAvgTemp,
        emChangesData,
        oilBurnerChangesData,
        pro3StatusData,
        pro3OverrideStatusData,
        selectedTempsData,
      ] = await Promise.all([
        safe('ping', heatHarmonyClient.getPingStatus()),
        safe('heatAutomationStatus', heatHarmonyClient.getHeatAutomationStatus()),
        safe('overrideStatus', heatHarmonyClient.getOverrideStatus()),
        safe('oumanLatest', heatHarmonyClient.getOumanLatestData()),
        safe('oumanStatus', heatHarmonyClient.getOumanStatus()),
        safe('heishamonLatest', heatHarmonyClient.getLatestHeishamonData()),
        safe('heishamonStatus', heatHarmonyClient.getHeishamonStatus()),
        safe('trvLatest', heatHarmonyClient.getTrvLatestData()),
        safe('oilburnerLatest', heatHarmonyClient.getOilburnerLatestData()),
        safe('useWaterHeaterLatest', heatHarmonyClient.getUseWaterHeaterLatest()),
        safe('useWaterHeaterOverrideStatus', heatHarmonyClient.getUseWaterHeaterOverrideStatus()),
        safe('uptime', heatHarmonyClient.getUptime()),
        safe('restlessFalconAvgTemp', heatHarmonyClient.getRestlessFalconAvgTemperature(2)),
        safe('emChanges', heatHarmonyClient.getEMChanges()),
        safe('oilBurnerChanges', heatHarmonyClient.getOilBurnerChanges()),
        safe('pro3Status', heatHarmonyClient.getPro3Status()),
        safe('pro3OverrideStatus', heatHarmonyClient.getPro3OverrideStatus()),
        safe('selectedTemps', heatHarmonyClient.getSelectedTemps()),
      ]);

      if (ping) setHeatAutomationPingStatus(ping);
      if (automationStatus) setHeatAutomationStatus(automationStatus);
      if (automationOverrideStatus) setOverrideStatus(automationOverrideStatus);

      if (oumanLatestData) setOumanLatest(oumanLatestData);
      if (oumanStatusData) setOumanStatus(oumanStatusData);

      if (heishamonLatestData) setHeishamonLatest(heishamonLatestData);
      if (heishamonStatusData) setHeishamonStatus(heishamonStatusData);

      if (trvLatestData) setTrvLatest(trvLatestData);

      if (oilburnerLatestData) setOilburnerLatest(oilburnerLatestData);
      if (useWaterHeaterLatestData) setUseWaterHeaterLatest(useWaterHeaterLatestData);
      if (useWaterHeaterOverrideStatus) setEnableUseWaterHeaterData(useWaterHeaterOverrideStatus);

      if (uptimeData) setUptime(uptimeData);
      if (restlessFalconAvgTemp) setAvgTempLast2Days(restlessFalconAvgTemp.averageTemperature);
      if (emChangesData) setEmChanges(emChangesData);
      if (oilBurnerChangesData) setOilBurnerChanges(oilBurnerChangesData);
      if (pro3StatusData) setPro3Status(pro3StatusData);
      if (pro3OverrideStatusData) setPro3OverrideStatus(pro3OverrideStatusData);
      if (selectedTempsData) setSelectedTemps(selectedTempsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [heatHarmonyClient]);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 60000); // Refresh every 60s
    return () => clearInterval(interval);
  }, [fetchData]);

  const runAction = useCallback(
    async (label: string, action: () => Promise<void>) => {
      setLoading(true);
      setActionStatus(undefined);
      try {
        await action();
        setActionStatus({type: 'success', message: `${label} succeeded.`});
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`Failed to ${label.toLowerCase()}:`, error);
        setActionStatus({type: 'error', message: `${label} failed: ${message}`});
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleSetOverride = async () => {
    await runAction('Set temperature override', async () => {
      const payload: HeatAutomationOverrideRequest = {
        temperature: overrideTemp,
        hours: overrideHours,
        overRidePrevious: overrideOverridePrevious,
        delay: overrideDelay,
        quietMode: 0,
      };
      await heatHarmonyClient.setOverride(payload);
      await fetchData();
    });
  };

  const handleCancelOverride = async () => {
    await runAction('Cancel temperature override', async () => {
      await heatHarmonyClient.removeOverride();
      await fetchData();
    });
  };

  const handleOilBurnerControl = async (action: 'enable' | 'disable') => {
    await runAction(`${action === 'enable' ? 'Enable' : 'Disable'} oil burner`, async () => {
      if (action === 'enable') {
        await heatHarmonyClient.enableOilburner();
      } else {
        await heatHarmonyClient.disableOilburner();
      }
      const data = await heatHarmonyClient.getOilburnerLatestData();
      setOilburnerLatest(data);
      await fetchData();
    });
  };

  const handleUseWaterHeaterControl = async (action: 'enable' | 'disable') => {
    await runAction(`${action === 'enable' ? 'Enable' : 'Disable'} use water heater`, async () => {
      if (action === 'enable') {
        await heatHarmonyClient.enableUseWaterHeater();
      } else {
        await heatHarmonyClient.disableUseWaterHeater();
      }
      const data = await heatHarmonyClient.getUseWaterHeaterLatest();
      setUseWaterHeaterLatest(data);
      await fetchData();
    });
  };

  const handleUseWaterHeaterOverride = async (mode: 'enable' | 'disable') => {
    await runAction(`Set use water heater override (${mode})`, async () => {
      if (mode === 'enable') {
        await heatHarmonyClient.setEnableUseWaterHeaterOverride(useWaterOverrideHours);
      } else {
        await heatHarmonyClient.setDisableUseWaterHeaterOverride(useWaterOverrideHours);
      }
      const data = await heatHarmonyClient.getUseWaterHeaterLatest();
      setUseWaterHeaterLatest(data);
      await fetchData();
    });
  };

  const handleClearUseWaterHeaterOverride = async () => {
    await runAction('Clear use water heater override', async () => {
      await heatHarmonyClient.deleteUseWaterHeaterOverride();
      const data = await heatHarmonyClient.getUseWaterHeaterLatest();
      setUseWaterHeaterLatest(data);
      await fetchData();
    });
  };

  const handlePro3Override = async () => {
    await runAction('Set Pro3 override', async () => {
      await heatHarmonyClient.overridePro3Output(pro3OutputAmount, pro3Output, pro3DurationMinutes);
      await fetchData();
    });
  };

  const handlePro3CancelOverride = async () => {
    await runAction('Cancel Pro3 override', async () => {
      await heatHarmonyClient.cancelPro3Override();
      await fetchData();
    });
  };

  const formatDateTime = (value: string | undefined) => formatDateTimeFi(value);

  const isPingOk = (heatAutomationPingStatus.status ?? '').toLowerCase() === 'pong';

  const sortChangesByTimeDesc = useCallback(<T extends {time?: string}>(changes: T[]) => {
    const toMs = (value: string | undefined) => {
      if (!value) return Number.NEGATIVE_INFINITY;
      const ms = new Date(value).getTime();
      return Number.isNaN(ms) ? Number.NEGATIVE_INFINITY : ms;
    };
    return [...changes].sort((a, b) => toMs(b.time) - toMs(a.time));
  }, []);

  const oumanRecentChanges = useMemo(
    () => sortChangesByTimeDesc(oumanStatus?.changes ?? []).slice(0, 5),
    [oumanStatus?.changes, sortChangesByTimeDesc]
  );

  const heishamonRecentChanges = useMemo(
    () => sortChangesByTimeDesc(heishamonStatus?.changes ?? []).slice(0, 5),
    [heishamonStatus?.changes, sortChangesByTimeDesc]
  );

  const emRecentChanges = useMemo(
    () => sortChangesByTimeDesc(emChanges?.changes ?? []).slice(0, 5),
    [emChanges?.changes, sortChangesByTimeDesc]
  );

  const oilBurnerRecentChanges = useMemo(
    () => sortChangesByTimeDesc(oilBurnerChanges?.changes ?? []).slice(0, 5),
    [oilBurnerChanges?.changes, sortChangesByTimeDesc]
  );

  const formatNumber = (value: number | null | undefined, digits?: number) => {
    if (value === null || value === undefined) return '—';
    if (digits === undefined) return String(value);
    return value.toFixed(digits);
  };

  const getUseWaterOverrideLabel = () => {
    if (!enableUseWaterHeaterData?.isOverrideActive) return 'No override';
    switch (enableUseWaterHeaterData.overrideMode) {
      case EMOverrideMode.Enable:
        return 'Override: Enable';
      case EMOverrideMode.Disable:
        return 'Override: Disable';
      default:
        return 'Override active';
    }
  };

  return (
    <div className="space-y-6 dark">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Home Heating Control</h1>
        <div className="flex items-center gap-2">
          <Badge variant={isPingOk ? 'default' : 'destructive'}>
            Ping: {isPingOk ? 'Ok' : heatAutomationPingStatus.status ?? 'No response'}
          </Badge>
          {uptime?.uptime?.duration && (
            <Badge variant="secondary">Up: {uptime.uptime.duration}</Badge>
          )}
          {heatAutomationStatus?.isWorkerRunning ? (
            <Badge variant="default" className="gap-1">
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-3 w-3" />
              Automation Active
            </Badge>
          ) : (
            <Badge variant="destructive" className="gap-1">
              <HugeiconsIcon icon={AlertCircleIcon} className="h-3 w-3" />
              Automation Stopped
            </Badge>
          )}
        </div>
      </div>

      {actionStatus && (
        <div
          className={`rounded-lg border p-3 text-sm flex items-start justify-between gap-3 ${actionStatus.type === 'error'
            ? 'border-destructive/60 bg-destructive/10 text-destructive'
            : 'border-emerald-600/60 bg-emerald-600/10 text-emerald-500'
            }`}
          role={actionStatus.type === 'error' ? 'alert' : 'status'}
        >
          <div className="flex items-start gap-2">
            <HugeiconsIcon
              icon={actionStatus.type === 'error' ? AlertCircleIcon : CheckmarkCircle02Icon}
              className="h-4 w-4 mt-0.5 shrink-0"
            />
            <span className="break-words">{actionStatus.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionStatus(undefined)}
            className="text-xs underline opacity-80 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HeatHarmony Status</CardTitle>
            <CardDescription>Backend connectivity and workers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backend serverTime: {formatDateTime(heatAutomationPingStatus.serverTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HeatHarmony serverTime: {formatDateTime(heatAutomationStatus?.serverTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Avg outside temp (2 days): {avgTempLast2Days === undefined ? '—' : `${avgTempLast2Days.toFixed(1)}°C`}
                </span>
              </div>
            </div>
            {selectedTemps && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-sm font-medium">Selected temperatures</span>
                  <div className="grid gap-2 md:grid-cols-4">
                    <div className="rounded-lg border p-3 space-y-1">
                      <div className="text-xs text-muted-foreground">Min</div>
                      <div className="text-sm font-medium">{selectedTemps.minTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="rounded-lg border p-3 space-y-1">
                      <div className="text-xs text-muted-foreground">Mid</div>
                      <div className="text-sm font-medium">{selectedTemps.midTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="rounded-lg border p-3 space-y-1">
                      <div className="text-xs text-muted-foreground">Max</div>
                      <div className="text-sm font-medium">{selectedTemps.maxTemp.toFixed(1)}°C</div>
                    </div>
                    <div className="rounded-lg border p-3 space-y-1">
                      <div className="text-xs text-muted-foreground">Max heating period</div>
                      <div className="text-sm font-medium">{selectedTemps.maxHeatingPeriodTemp.toFixed(1)}°C</div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flow demand</CardTitle>
              <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{oumanLatest?.flowDemand?.toFixed(1)}°C</div>
              <p className="text-xs text-muted-foreground">Minimum allowed: {oumanLatest?.minFlowTemp?.toFixed(1)}°C</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shunt autodrive status</CardTitle>
              <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{oumanLatest?.autoTemp ? 'On' : 'Off'}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heat Pump</CardTitle>
              <HugeiconsIcon icon={DropletIcon} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{heishamonLatest?.targetTemp}°C</div>
              <p className="text-xs text-muted-foreground">
                In: {heishamonLatest?.inletTemp}°C / Out: {heishamonLatest?.outletTemp}°C
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Heat Pump details</CardTitle>
              <HugeiconsIcon icon={DropletIcon} className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Quiet mode</span>
                  <span className="text-xs font-medium">{formatNumber(heishamonLatest?.quietMode)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pump flow</span>
                  <span className="text-xs font-medium">{formatNumber(heishamonLatest?.pumpFlow, 1)} l/min</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Compressor frequency</span>
                  <span className="text-xs font-medium">{formatNumber(heishamonLatest?.compressorFrequency, 0)} Hz</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Heat power production</span>
                  <span className="text-xs font-medium">{formatNumber(heishamonLatest?.heatEnergyProduction, 0)} W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Heat power consumption</span>
                  <span className="text-xs font-medium">{formatNumber(heishamonLatest?.heatEnergyConsumption, 0)} W</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Coefficient of Performance (COP)</span>
                  <span className="text-xs font-medium">{formatNumber(heishamonLatest?.cop, 2)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Pump error</span>
                  <span className="text-xs font-medium">{heishamonLatest?.pumpError ?? 'No error'}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Updated: {formatDateTime(heishamonLatest?.serverTime)}</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Temperature Override</CardTitle>
            <CardDescription>Manually set indoor temperature for a specific duration</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {overrideStatus && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium">
                  Override: {overrideStatus.isActive ? 'Active' : 'Inactive'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Target: {Number.isFinite(overrideStatus.targetTemp) ? `${overrideStatus.targetTemp}°C` : '—'}
                  {overrideStatus.until ? ` until ${formatDateTime(overrideStatus.until)}` : ''}
                </p>
                <p className="text-xs text-muted-foreground mt-1">serverTime: {formatDateTime(overrideStatus.serverTime)}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="temp">Temperature (°C)</Label>
                <Input
                  id="temp"
                  type="number"
                  value={overrideTemp}
                  onChange={(e: {target: {value: any}}) => setOverrideTemp(Number(e.target.value))}
                  min={15}
                  max={25}
                  step={0.5}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hours">Duration (hours)</Label>
                <Input
                  id="hours"
                  type="number"
                  value={overrideHours}
                  onChange={(e: {target: {value: any}}) => setOverrideHours(Number(e.target.value))}
                  min={1}
                  max={24}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="delay">Delay (hours)</Label>
                <Input
                  id="delay"
                  type="number"
                  value={overrideDelay}
                  onChange={(e: {target: {value: any}}) => setOverrideDelay(Number(e.target.value))}
                  min={0}
                  max={12}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="overRidePrevious"
                checked={overrideOverridePrevious}
                onCheckedChange={(checked) => setOverrideOverridePrevious(Boolean(checked))}
              />
              <Label htmlFor="overRidePrevious">Override previous</Label>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSetOverride} disabled={loading}>
                Set Override
              </Button>
              <Button variant="outline" onClick={handleCancelOverride} disabled={loading}>
                Cancel Override
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Changes</CardTitle>
            <CardDescription>Latest actions reported by Ouman and Heishamon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ouman</span>
                  <span className="text-xs text-muted-foreground">serverTime: {formatDateTime(oumanStatus?.serverTime)}</span>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  {oumanRecentChanges.map((c) => (
                    <div key={`${c.time}-${c.changeType}`} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{convertHarmonyChangeEnumToString(c.changeType)}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.time)}</span>
                      </div>
                      {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                    </div>
                  ))}
                  {(oumanStatus?.changes?.length ?? 0) === 0 && (
                    <div className="text-sm text-muted-foreground">No changes.</div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Heishamon</span>
                  <span className="text-xs text-muted-foreground">changes: {heishamonStatus?.changes?.length ?? 0}</span>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  {heishamonRecentChanges.map((c) => (
                    <div key={`${c.time}-${c.changeType}`} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{convertHarmonyChangeEnumToString(c.changeType)}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.time)}</span>
                      </div>
                      {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                    </div>
                  ))}
                  {(heishamonStatus?.changes?.length ?? 0) === 0 && (
                    <div className="text-sm text-muted-foreground">No changes.</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Heating Controls</CardTitle>
            <CardDescription>Oil burner + water heater (use water) control and overrides</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Oil burner</span>
                <Badge variant={oilburnerLatest?.isRunning ? 'default' : 'destructive'} className="gap-1">
                  <HugeiconsIcon icon={FireIcon} className="h-3 w-3" />
                  {oilburnerLatest?.isRunning ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={() => handleOilBurnerControl('enable')}
                  disabled={loading || oilburnerLatest?.isRunning}
                  variant="default"
                >
                  <HugeiconsIcon icon={FireIcon} className="mr-2 h-4 w-4" />
                  Enable Oil Burner
                </Button>
                <Button
                  onClick={() => handleOilBurnerControl('disable')}
                  disabled={loading || !oilburnerLatest?.isRunning}
                  variant="outline"
                >
                  Disable Oil Burner
                </Button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Recent changes</span>
                  <span className="text-xs text-muted-foreground">total: {oilBurnerChanges?.changes?.length ?? 0}</span>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  {oilBurnerRecentChanges.map((c) => (
                    <div key={`${c.time}-${c.changeType}`} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{convertHarmonyChangeEnumToString(c.changeType)}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.time)}</span>
                      </div>
                      {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                    </div>
                  ))}
                  {oilBurnerRecentChanges.length === 0 && (
                    <div className="text-sm text-muted-foreground">No changes.</div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Water heater (use water)</span>
                <div className="flex items-center gap-2">
                  <Badge variant={useWaterHeaterLatest?.isOn ? 'default' : 'secondary'}>
                    {useWaterHeaterLatest?.isOn ? 'On' : 'Off'}
                  </Badge>
                  <Badge variant={enableUseWaterHeaterData?.isOverrideActive ? 'secondary' : 'default'}>
                    {getUseWaterOverrideLabel()}
                  </Badge>
                </div>
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <div>
                  Running: {useWaterHeaterLatest?.isRunning === undefined ? '—' : useWaterHeaterLatest.isRunning ? 'Yes' : 'No'}
                </div>
                <div>Last enabled: {formatDateTime(useWaterHeaterLatest?.lastEnabled)}</div>
                <div>Last disabled: {formatDateTime(useWaterHeaterLatest?.lastDisabled)}</div>
                <div>Override until: {formatDateTime(enableUseWaterHeaterData?.overrideUntil ?? undefined)}</div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={() => handleUseWaterHeaterControl('enable')} disabled={loading} variant="default">
                  Enable Use Water heating
                </Button>
                <Button onClick={() => handleUseWaterHeaterControl('disable')} disabled={loading} variant="outline">
                  Disable Use Water heating
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3 items-end">
                <div className="space-y-2">
                  <Label htmlFor="useWaterOverrideHours">Override duration (hours)</Label>
                  <Input
                    id="useWaterOverrideHours"
                    type="number"
                    value={useWaterOverrideHours}
                    onChange={(e: {target: {value: any}}) => setUseWaterOverrideHours(Number(e.target.value))}
                    min={1}
                    max={48}
                  />
                </div>
                <div className="flex flex-wrap gap-2 md:col-span-2">
                  <Button onClick={() => handleUseWaterHeaterOverride('enable')} disabled={loading}>
                    Override Enable
                  </Button>
                  <Button onClick={() => handleUseWaterHeaterOverride('disable')} disabled={loading} variant="outline">
                    Override Disable
                  </Button>
                  <Button onClick={handleClearUseWaterHeaterOverride} disabled={loading} variant="outline">
                    Clear Override
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Recent changes</span>
                  <span className="text-xs text-muted-foreground">total: {emChanges?.changes?.length ?? 0}</span>
                </div>
                <div className="rounded-lg border p-3 space-y-2">
                  {emRecentChanges.map((c) => (
                    <div key={`${c.time}-${c.changeType}`} className="text-sm">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium">{convertHarmonyChangeEnumToString(c.changeType)}</span>
                        <span className="text-xs text-muted-foreground">{formatDateTime(c.time)}</span>
                      </div>
                      {c.description && <div className="text-xs text-muted-foreground">{c.description}</div>}
                    </div>
                  ))}
                  {emRecentChanges.length === 0 && (
                    <div className="text-sm text-muted-foreground">No changes.</div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pro3 Resistor Control</CardTitle>
            <CardDescription>
              Shelly Pro3 outputs control the heating resistor (1 output = 2kW, 2 = 4kW, 3 = 6kW)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Current outputs</span>
                  <Badge variant="secondary">
                    {(pro3Status ?? []).filter((o) => o.output).length} / {pro3Status?.length ?? 0} on
                  </Badge>
                </div>
                <div className="space-y-1">
                  {(pro3Status ?? []).map((o, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Output {idx + 1}</span>
                      <Badge variant={o.output ? 'default' : 'secondary'}>{o.output ? 'On' : 'Off'}</Badge>
                    </div>
                  ))}
                  {(pro3Status?.length ?? 0) === 0 && (
                    <div className="text-sm text-muted-foreground">No outputs reported.</div>
                  )}
                </div>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">Override status</span>
                  <Badge variant={pro3OverrideStatus?.isOverridden ? 'default' : 'secondary'}>
                    {pro3OverrideStatus?.isOverridden ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div>
                    Output amount:{' '}
                    {pro3OverrideStatus?.outputAmount === undefined || pro3OverrideStatus?.outputAmount === null
                      ? '—'
                      : `${pro3OverrideStatus.outputAmount} (~${pro3OverrideStatus.outputAmount * 2}kW)`}
                  </div>
                  <div>
                    Output state:{' '}
                    {pro3OverrideStatus?.outputState === undefined || pro3OverrideStatus?.outputState === null
                      ? '—'
                      : pro3OverrideStatus.outputState
                        ? 'On'
                        : 'Off'}
                  </div>
                  <div>Until: {formatDateTime(pro3OverrideStatus?.until ?? undefined)}</div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="grid gap-4 md:grid-cols-4 items-end">
              <div className="space-y-2">
                <Label htmlFor="pro3OutputAmount">Outputs on (1-3)</Label>
                <Input
                  id="pro3OutputAmount"
                  type="number"
                  value={pro3OutputAmount}
                  onChange={(e: {target: {value: any}}) => setPro3OutputAmount(Number(e.target.value))}
                  min={1}
                  max={3}
                />
                <p className="text-xs text-muted-foreground">~{pro3OutputAmount * 2} kW</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pro3DurationMinutes">Duration (minutes)</Label>
                <Input
                  id="pro3DurationMinutes"
                  type="number"
                  value={pro3DurationMinutes}
                  onChange={(e: {target: {value: any}}) => setPro3DurationMinutes(Number(e.target.value))}
                  min={1}
                  max={1440}
                />
              </div>
              <div className="flex items-center gap-2 pb-2">
                <Checkbox
                  id="pro3Output"
                  checked={pro3Output}
                  onCheckedChange={(checked) => setPro3Output(Boolean(checked))}
                />
                <Label htmlFor="pro3Output">Output on</Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={handlePro3Override} disabled={loading}>
                  Apply Override
                </Button>
                <Button onClick={handlePro3CancelOverride} disabled={loading} variant="outline">
                  Cancel Override
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {trvLatest?.devices && trvLatest.devices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Thermostatic Radiator Valves</CardTitle>
              <CardDescription>Status of radiator controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {trvLatest.devices.map((trv, idx: number) => (
                  <div key={idx} className="rounded-lg border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{trv.name ?? 'Unnamed'}</h4>
                      <Badge variant={trv.status === 1 ? 'default' : 'secondary'}>
                        {trv.status === 1 ? 'OK' : trv.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div className="flex items-center gap-1">
                        <HugeiconsIcon icon={BatteryFullIcon} className="h-3 w-3" />
                        <span>{trv.batteryLevel}%</span>
                      </div>
                      <p>Level: {trv.latestLevel?.toFixed(1)}%</p>
                      <p>Auto: {trv.autoTemperature ? 'Yes' : 'No'}</p>
                      {trv.message && trv.status !== 1 && <p>Message: {trv.message}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}