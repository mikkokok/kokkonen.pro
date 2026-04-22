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
import {HeatAutomationTaskResponse} from '../lib/heatHarmony/validation/heatAutomationTaskResponse';
import {HeatAutomationOverrideStatusResponse} from '../lib/heatHarmony/validation/heatAutomationOverrideStatusResponse';
import {HeishamonLatestResponse} from '../lib/heatHarmony/validation/heishamonLatestResponse';
import {HeishamonStatusResponse} from '../lib/heatHarmony/validation/heishamonStatusResponse';
import {HeishamonTaskResponse} from '../lib/heatHarmony/validation/heishamonTaskResponse';
import {OumanLatestResponse} from '../lib/heatHarmony/validation/oumanLatestResponse';
import {OumanStatusResponse} from '../lib/heatHarmony/validation/oumanStatusResponse';
import {OumanTaskResponse} from '../lib/heatHarmony/validation/oumanTaskResponse';
import {TrvLatestResponse} from '../lib/heatHarmony/validation/trvLatestResponse';
import {TrvTaskResponse} from '../lib/heatHarmony/validation/trvTaskResponse';
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
import {Checkbox} from './ui/checkbox';
import {formatDateTimeFi} from '../lib/dateTimeFormat';

export function HomeHeating() {
  const [loading, setLoading] = useState(false);
  const [heatAutomationPingStatus, setHeatAutomationPingStatus] = useState<PingResponse>({status: null, serverTime: undefined});
  const [heatAutomationStatus, setHeatAutomationStatus] = useState<HeatAutomationStatusResponse | undefined>(undefined);
  const [heatAutomationTaskStatus, setHeatAutomationTaskStatus] = useState<HeatAutomationTaskResponse | undefined>(undefined);
  const [overrideStatus, setOverrideStatus] = useState<HeatAutomationOverrideStatusResponse | undefined>(undefined);

  const [overrideTemp, setOverrideTemp] = useState<number>(21);
  const [overrideHours, setOverrideHours] = useState<number>(2);
  const [overrideDelay, setOverrideDelay] = useState<number>(0);

  const [oumanLatest, setOumanLatest] = useState<OumanLatestResponse | undefined>(undefined);
  const [oumanStatus, setOumanStatus] = useState<OumanStatusResponse | undefined>(undefined);
  const [oumanTaskStatus, setOumanTaskStatus] = useState<OumanTaskResponse | undefined>(undefined);

  const [heishamonLatest, setHeishamonLatest] = useState<HeishamonLatestResponse | undefined>(undefined);
  const [heishamonStatus, setHeishamonStatus] = useState<HeishamonStatusResponse | undefined>(undefined);
  const [heishamonTaskStatus, setHeishamonTaskStatus] = useState<HeishamonTaskResponse | undefined>(undefined);

  const [trvLatest, setTrvLatest] = useState<TrvLatestResponse | undefined>(undefined);
  const [trvTaskStatus, setTrvTaskStatus] = useState<TrvTaskResponse | undefined>(undefined);
  const [oilburnerLatest, setOilburnerLatest] = useState<OilburnerLatestResponse | undefined>(undefined);
  const [enableUseWaterHeaterData, setEnableUseWaterHeaterData] = useState<EMOverrideStatusResponse | undefined>(undefined);
  const [useWaterHeaterLatest, setUseWaterHeaterLatest] = useState<EMLatestResponse | undefined>(undefined);
  const [useWaterOverrideHours, setUseWaterOverrideHours] = useState<number>(2);

  const [uptime, setUptime] = useState<UptimeResponse | undefined>(undefined);
  const [emChanges, setEmChanges] = useState<EmChangesResponse | undefined>(undefined);
  const [oilBurnerChanges, setOilBurnerChanges] = useState<OilBurnerChangesResponse | undefined>(undefined);
  const [pro3Status, setPro3Status] = useState<Pro3StatusResponse | undefined>(undefined);
  const [pro3OverrideStatus, setPro3OverrideStatus] = useState<Pro3OverrideStatusResponse | undefined>(undefined);
  const [pro3OutputAmount, setPro3OutputAmount] = useState<number>(1);
  const [pro3Output, setPro3Output] = useState<boolean>(true);
  const [pro3DurationMinutes, setPro3DurationMinutes] = useState<number>(60);

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
        automationTaskStatus,
        automationOverrideStatus,
        oumanLatestData,
        oumanStatusData,
        oumanTaskStatusData,
        heishamonLatestData,
        heishamonStatusData,
        heishamonTaskStatusData,
        trvLatestData,
        trvTaskStatusData,
        oilburnerLatestData,
        useWaterHeaterLatestData,
        useWaterHeaterOverrideStatus,
        uptimeData,
        emChangesData,
        oilBurnerChangesData,
        pro3StatusData,
        pro3OverrideStatusData,
      ] = await Promise.all([
        safe('ping', heatHarmonyClient.getPingStatus()),
        safe('heatAutomationStatus', heatHarmonyClient.getHeatAutomationStatus()),
        safe('heatAutomationTaskStatus', heatHarmonyClient.getHeatAutomationTaskStatus()),
        safe('overrideStatus', heatHarmonyClient.getOverrideStatus()),
        safe('oumanLatest', heatHarmonyClient.getOumanLatestData()),
        safe('oumanStatus', heatHarmonyClient.getOumanStatus()),
        safe('oumanTaskStatus', heatHarmonyClient.getOumanTaskStatus()),
        safe('heishamonLatest', heatHarmonyClient.getLatestHeishamonData()),
        safe('heishamonStatus', heatHarmonyClient.getHeishamonStatus()),
        safe('heishamonTaskStatus', heatHarmonyClient.getHeishamonTaskStatus()),
        safe('trvLatest', heatHarmonyClient.getTrvLatestData()),
        safe('trvTaskStatus', heatHarmonyClient.getTrvTaskStatus()),
        safe('oilburnerLatest', heatHarmonyClient.getOilburnerLatestData()),
        safe('useWaterHeaterLatest', heatHarmonyClient.getUseWaterHeaterLatest()),
        safe('useWaterHeaterOverrideStatus', heatHarmonyClient.getUseWaterHeaterOverrideStatus()),
        safe('uptime', heatHarmonyClient.getUptime()),
        safe('emChanges', heatHarmonyClient.getEMChanges()),
        safe('oilBurnerChanges', heatHarmonyClient.getOilBurnerChanges()),
        safe('pro3Status', heatHarmonyClient.getPro3Status()),
        safe('pro3OverrideStatus', heatHarmonyClient.getPro3OverrideStatus()),
      ]);

      if (ping) setHeatAutomationPingStatus(ping);
      if (automationStatus) setHeatAutomationStatus(automationStatus);
      if (automationTaskStatus) setHeatAutomationTaskStatus(automationTaskStatus);
      if (automationOverrideStatus) setOverrideStatus(automationOverrideStatus);

      if (oumanLatestData) setOumanLatest(oumanLatestData);
      if (oumanStatusData) setOumanStatus(oumanStatusData);
      if (oumanTaskStatusData) setOumanTaskStatus(oumanTaskStatusData);

      if (heishamonLatestData) setHeishamonLatest(heishamonLatestData);
      if (heishamonStatusData) setHeishamonStatus(heishamonStatusData);
      if (heishamonTaskStatusData) setHeishamonTaskStatus(heishamonTaskStatusData);

      if (trvLatestData) setTrvLatest(trvLatestData);
      if (trvTaskStatusData) setTrvTaskStatus(trvTaskStatusData);

      if (oilburnerLatestData) setOilburnerLatest(oilburnerLatestData);
      if (useWaterHeaterLatestData) setUseWaterHeaterLatest(useWaterHeaterLatestData);
      if (useWaterHeaterOverrideStatus) setEnableUseWaterHeaterData(useWaterHeaterOverrideStatus);

      if (uptimeData) setUptime(uptimeData);
      if (emChangesData) setEmChanges(emChangesData);
      if (oilBurnerChangesData) setOilBurnerChanges(oilBurnerChangesData);
      if (pro3StatusData) setPro3Status(pro3StatusData);
      if (pro3OverrideStatusData) setPro3OverrideStatus(pro3OverrideStatusData);
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

  const handleSetOverride = async () => {
    setLoading(true);
    try {
      const payload: HeatAutomationOverrideRequest = {
        temperature: overrideTemp,
        hours: overrideHours,
        overRidePrevious: true,
        delay: overrideDelay,
      };

      await heatHarmonyClient.setOverride(payload);
      await fetchData();
    } catch (error) {
      console.error('Failed to set override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOverride = async () => {
    setLoading(true);
    try {
      await heatHarmonyClient.removeOverride();
      await fetchData();
    } catch (error) {
      console.error('Failed to cancel override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOilBurnerControl = async (action: 'enable' | 'disable') => {
    setLoading(true);
    try {
      if (action === 'enable') {
        await heatHarmonyClient.enableOilburner();
        const data = await heatHarmonyClient.getOilburnerLatestData();
        setOilburnerLatest(data);
      } else {
        await heatHarmonyClient.disableOilburner();
        const data = await heatHarmonyClient.getOilburnerLatestData();
        setOilburnerLatest(data);
      }
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} oil burner:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseWaterHeaterControl = async (action: 'enable' | 'disable') => {
    setLoading(true);
    try {
      if (action === 'enable') {
        await heatHarmonyClient.enableUseWaterHeater();
      } else {
        await heatHarmonyClient.disableUseWaterHeater();
      }
      const data = await heatHarmonyClient.getUseWaterHeaterLatest();
      setUseWaterHeaterLatest(data);
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} use water heater:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseWaterHeaterOverride = async (mode: 'enable' | 'disable') => {
    setLoading(true);
    try {
      if (mode === 'enable') {
        await heatHarmonyClient.setEnableUseWaterHeaterOverride(useWaterOverrideHours);
      } else {
        await heatHarmonyClient.setDisableUseWaterHeaterOverride(useWaterOverrideHours);
      }
      const data = await heatHarmonyClient.getUseWaterHeaterLatest();
      setUseWaterHeaterLatest(data);
      await fetchData();
    } catch (error) {
      console.error(`Failed to set use water heater override (${mode}):`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearUseWaterHeaterOverride = async () => {
    setLoading(true);
    try {
      await heatHarmonyClient.deleteUseWaterHeaterOverride();
      const data = await heatHarmonyClient.getUseWaterHeaterLatest();
      setUseWaterHeaterLatest(data);
      await fetchData();
    } catch (error) {
      console.error('Failed to clear use water heater override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePro3Override = async () => {
    setLoading(true);
    try {
      await heatHarmonyClient.overridePro3Output(pro3OutputAmount, pro3Output, pro3DurationMinutes);
      await fetchData();
    } catch (error) {
      console.error('Failed to set Pro3 override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePro3CancelOverride = async () => {
    setLoading(true);
    try {
      await heatHarmonyClient.cancelPro3Override();
      await fetchData();
    } catch (error) {
      console.error('Failed to cancel Pro3 override:', error);
    } finally {
      setLoading(false);
    }
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

  const renderErrors = (errors: string[] | null | undefined) => {
    if (!errors || errors.length === 0) return null;
    return (
      <div className="space-y-1">
        {errors.slice(0, 5).map((e, idx) => (
          <p key={idx} className="text-xs text-muted-foreground">
            {e}
          </p>
        ))}
        {errors.length > 5 && (
          <p className="text-xs text-muted-foreground">…and {errors.length - 5} more</p>
        )}
      </div>
    );
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

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>HeatHarmony Status</CardTitle>
            <CardDescription>Backend connectivity, workers, and scheduled tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backend serverTime: {formatDateTime(heatAutomationPingStatus.serverTime)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">HeatHarmony serverTime: {formatDateTime(heatAutomationStatus?.serverTime)}</span>
              </div>
            </div>

            <Separator />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ouman + Heishamon sync</span>
                  <Badge variant={heatAutomationTaskStatus?.oumanAndHeishamonSync.status === 'Ok' ? 'default' : 'secondary'}>
                    {heatAutomationTaskStatus?.oumanAndHeishamonSync.status ?? '—'}
                  </Badge>
                </div>
                {renderErrors(heatAutomationTaskStatus?.oumanAndHeishamonSync.errors)}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Water heating by price</span>
                  <Badge variant={heatAutomationTaskStatus?.setUseWaterBasedOnPrice.status === 'Ok' ? 'default' : 'secondary'}>
                    {heatAutomationTaskStatus?.setUseWaterBasedOnPrice.status ?? '—'}
                  </Badge>
                </div>
                {renderErrors(heatAutomationTaskStatus?.setUseWaterBasedOnPrice.errors)}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inside temp by price</span>
                  <Badge variant={heatAutomationTaskStatus?.setInsideTempBasedOnPrice.status === 'Ok' ? 'default' : 'secondary'}>
                    {heatAutomationTaskStatus?.setInsideTempBasedOnPrice.status ?? '—'}
                  </Badge>
                </div>
                {renderErrors(heatAutomationTaskStatus?.setInsideTempBasedOnPrice.errors)}
              </div>
            </div>
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
            <CardTitle>Device Tasks</CardTitle>
            <CardDescription>Ouman, Heishamon and TRV task status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Ouman task</span>
                  <Badge variant={oumanTaskStatus?.status === 'Ok' ? 'default' : 'secondary'}>
                    {oumanTaskStatus?.status ?? '—'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">serverTime: {formatDateTime(oumanTaskStatus?.serverTime)}</div>
                {renderErrors(oumanTaskStatus?.errors)}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Heishamon task</span>
                  <Badge variant={heishamonTaskStatus?.status === 'Ok' ? 'default' : 'secondary'}>
                    {heishamonTaskStatus?.status ?? '—'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">serverTime: {formatDateTime(heishamonTaskStatus?.serverTime)}</div>
                {renderErrors(heishamonTaskStatus?.errors)}
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">TRV task</span>
                  <Badge variant={trvTaskStatus?.status === 'Ok' ? 'default' : 'secondary'}>
                    {trvTaskStatus?.status ?? '—'}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">serverTime: {formatDateTime(trvTaskStatus?.serverTime)}</div>
                {renderErrors(trvTaskStatus?.errors ?? undefined)}
              </div>
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
                    {(pro3Status ?? []).filter((o) => o.was_on).length} / {pro3Status?.length ?? 0} on
                  </Badge>
                </div>
                <div className="space-y-1">
                  {(pro3Status ?? []).map((o, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Output {idx + 1}</span>
                      <Badge variant={o.was_on ? 'default' : 'secondary'}>{o.was_on ? 'On' : 'Off'}</Badge>
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