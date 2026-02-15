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
import {HeatAutomationOverrideResponse} from '../lib/heatHarmony/validation/heatAutomationOverrideResponse';
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

export function HomeHeating() {
  const [loading, setLoading] = useState(false);
  const [heatAutomationPingStatus, setHeatAutomationPingStatus] = useState<PingResponse>({status: null, serverTime: undefined});
  const [heatAutomationStatus, setHeatAutomationStatus] = useState<HeatAutomationStatusResponse | undefined>(undefined);
  const [heatAutomationTaskStatus, setHeatAutomationTaskStatus] = useState<HeatAutomationTaskResponse | undefined>(undefined);
  const [overrideStatus, setOverrideStatus] = useState<HeatAutomationOverrideResponse | undefined>(undefined);

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
  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);

  const fetchData = useCallback(async () => {
    try {
      await Promise.all([
        heatHarmonyClient.getPingStatus().then(setHeatAutomationPingStatus),
        heatHarmonyClient.getHeatAutomationStatus().then(setHeatAutomationStatus),
        heatHarmonyClient.getHeatAutomationTaskStatus().then(setHeatAutomationTaskStatus),
        heatHarmonyClient.getOverrideStatus().then(setOverrideStatus),
        heatHarmonyClient.getOumanLatestData().then(setOumanLatest),
        heatHarmonyClient.getOumanStatus().then(setOumanStatus),
        heatHarmonyClient.getOumanTaskStatus().then(setOumanTaskStatus),
        heatHarmonyClient.getLatestHeishamonData().then(setHeishamonLatest),
        heatHarmonyClient.getHeishamonStatus().then(setHeishamonStatus),
        heatHarmonyClient.getHeishamonTaskStatus().then(setHeishamonTaskStatus),
        heatHarmonyClient.getTrvLatestData().then(setTrvLatest),
        heatHarmonyClient.getTrvTaskStatus().then(setTrvTaskStatus),
        heatHarmonyClient.getOilburnerLatestData().then(setOilburnerLatest),
        heatHarmonyClient.getUseWaterHeaterLatest().then(setUseWaterHeaterLatest),
        heatHarmonyClient.getUseWaterHeaterOverrideStatus().then(setEnableUseWaterHeaterData),
      ].map((p) => p.catch((error) => console.warn('HeatHarmony fetch failed:', error))));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  }, [heatHarmonyClient]);

  console.log('ouman status', oumanStatus);

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

  const formatDateTime = (value: string | undefined) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
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
          <Badge variant={heatAutomationPingStatus.status ? 'default' : 'destructive'}>
            Ping: {heatAutomationPingStatus.status ? 'Ok' : 'No response'}
          </Badge>
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

      <Card>
        <CardHeader>
          <CardTitle>HeatHarmony Status</CardTitle>
          <CardDescription>Backend connectivity, workers, and scheduled tasks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Ping serverTime:</span>
              <span className="text-sm text-muted-foreground">{formatDateTime(heatAutomationPingStatus.serverTime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Automation serverTime:</span>
              <span className="text-sm text-muted-foreground">{formatDateTime(heatAutomationStatus?.serverTime)}</span>
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

          <div className="text-xs text-muted-foreground">
            Tasks serverTime: {formatDateTime(heatAutomationTaskStatus?.serverTime)}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flow demand</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanLatest?.flowDemand?.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">
              Minimum allowed: {oumanLatest?.minFlowTemp?.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shunt autodrive status</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanLatest?.autoTemp ? "On" : "Off"}</div>
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
              In: {heishamonLatest?.inletTemp?.toFixed(1)}°C / Out: {heishamonLatest?.outletTemp?.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Temperature Override</CardTitle>
          <CardDescription>
            Manually set indoor temperature for a specific duration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {overrideStatus?.message && (
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-sm text-orange-800">{overrideStatus.message}</p>
              {overrideStatus.temperature && (
                <p className="text-xs text-orange-600 mt-1">
                  {overrideStatus.temperature}°C for {overrideStatus.hours}h
                  {overrideStatus.delayHours > 0 && ` (delayed ${overrideStatus.delayHours}h)`}
                </p>
              )}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="temp">Temperature (°C)</Label>
              <Input
                id="temp"
                type="number"
                value={overrideTemp}
                onChange={(e: {target: {value: any;};}) => setOverrideTemp(Number(e.target.value))}
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
                onChange={(e: {target: {value: any;};}) => setOverrideHours(Number(e.target.value))}
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
                onChange={(e: {target: {value: any;};}) => setOverrideDelay(Number(e.target.value))}
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
                {(oumanStatus?.changes ?? []).slice(0, 5).map((c, idx) => (
                  <div key={idx} className="text-sm">
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
                {(heishamonStatus?.changes ?? []).slice(0, 5).map((c, idx) => (
                  <div key={idx} className="text-sm">
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
              <div>Running: {useWaterHeaterLatest?.isRunning === undefined ? '—' : useWaterHeaterLatest.isRunning ? 'Yes' : 'No'}</div>
              <div>Last enabled: {formatDateTime(useWaterHeaterLatest?.lastEnabled)}</div>
              <div>Override until: {formatDateTime(enableUseWaterHeaterData?.overrideUntil)}</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={() => handleUseWaterHeaterControl('enable')}
                disabled={loading}
                variant="default"
              >
                Enable Use Water heating
              </Button>
              <Button
                onClick={() => handleUseWaterHeaterControl('disable')}
                disabled={loading}
                variant="outline"
              >
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
                <Button
                  onClick={() => handleUseWaterHeaterOverride('enable')}
                  disabled={loading}
                >
                  Override Enable
                </Button>
                <Button
                  onClick={() => handleUseWaterHeaterOverride('disable')}
                  disabled={loading}
                  variant="outline"
                >
                  Override Disable
                </Button>
                <Button
                  onClick={handleClearUseWaterHeaterOverride}
                  disabled={loading}
                  variant="outline"
                >
                  Clear Override
                </Button>
              </div>
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
  );
}