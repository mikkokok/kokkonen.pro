import {useEffect, useState} from 'react';
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
  Lightning,
  BatteryFullIcon,
} from '@hugeicons/core-free-icons';
import {HugeiconsIcon} from '@hugeicons/react';
import {backendUrl} from '../config/config';
import {HeatHarmonyClient} from '../lib/heatHarmony/heatHarmonyClient';

interface TemperatureOverride {
  temperature: number;
  hours: number;
  overRidePrevious: boolean;
  delay?: number;
}

export function HomeHeating() {
  const [loading, setLoading] = useState(false);
  const [overrideTemp, setOverrideTemp] = useState<number>(21);
  const [overrideHours, setOverrideHours] = useState<number>(2);
  const [overrideDelay, setOverrideDelay] = useState<number>(0);
  const [emHours, setEmHours] = useState<number>(2);

  // State for latest data
  const [oumanData, setOumanData] = useState<any>(null);
  const [heishaData, setHeishaData] = useState<any>(null);
  const [emData, setEmData] = useState<any>(null);
  const [oilBurnerData, setOilBurnerData] = useState<any>(null);
  const [trvData, setTrvData] = useState<any>(null);
  const [automationStatus, setAutomationStatus] = useState<any>(null);
  const [overrideStatus, setOverrideStatus] = useState<any>(null);
  const [emOverrideStatus, setEmOverrideStatus] = useState<any>(null);
  const heatHarmonyUrl = `${backendUrl}`;
  const heatHarmonyClient = new HeatHarmonyClient(backendUrl);

  const fetchData = async () => {
    try {
      // const [ouman, heisha, em, oil, trv, override, emOverride] = await Promise.all([
      //   fetch(`${heatHarmonyUrl}ouman/latest`).then(r => r.json()),
      //   fetch(`${heatHarmonyUrl}heishamon/latest`).then(r => r.json()),
      //   fetch(`${heatHarmonyUrl}em/latest`).then(r => r.json()),
      //   fetch(`${heatHarmonyUrl}oilburner/latest`).then(r => r.json()),
      //   fetch(`${heatHarmonyUrl}trv/latest`).then(r => r.json()),
      //   fetch(`${heatHarmonyUrl}heatautomation/override`).then(r => r.json()),
      //   fetch(`${heatHarmonyUrl}em/override/status`).then(r => r.json()),
      // ]);

      const automation = await heatHarmonyClient.getHeatAutomationStatus();

      // setOumanData(ouman);
      // setHeishaData(heisha);
      // setEmData(em);
      // setOilBurnerData(oil);
      // setTrvData(trv);
      setAutomationStatus(automation);
      // setOverrideStatus(override);
      // setEmOverrideStatus(emOverride);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const handleSetOverride = async () => {
    setLoading(true);
    try {
      const payload: TemperatureOverride = {
        temperature: overrideTemp,
        hours: overrideHours,
        overRidePrevious: true,
        delay: overrideDelay > 0 ? overrideDelay : undefined,
      };

      const response = await fetch(`${heatHarmonyUrl}heatautomation/override`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Failed to set override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOverride = async () => {
    setLoading(true);
    try {
      await fetch(`${heatHarmonyUrl}heatautomation/override`, {
        method: 'DELETE',
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to cancel override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEMControl = async (action: 'enable' | 'disable') => {
    setLoading(true);
    try {
      await fetch(`${heatHarmonyUrl}em/${action}`, {
        method: 'POST',
      });
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} EM:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleEMOverride = async (action: 'enable' | 'disable') => {
    setLoading(true);
    try {
      await fetch(`${heatHarmonyUrl}em/override/${action}/${emHours}`, {
        method: 'POST',
      });
      await fetchData();
    } catch (error) {
      console.error(`Failed to override EM:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearEMOverride = async () => {
    setLoading(true);
    try {
      await fetch(`${heatHarmonyUrl}em/override/delete`, {
        method: 'DELETE',
      });
      await fetchData();
    } catch (error) {
      console.error('Failed to clear EM override:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOilBurnerControl = async (action: 'enable' | 'disable') => {
    setLoading(true);
    try {
      await fetch(`${heatHarmonyUrl}oilburner/${action}`, {
        method: 'POST',
      });
      await fetchData();
    } catch (error) {
      console.error(`Failed to ${action} oil burner:`, error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Home Heating Control</h1>
        {automationStatus?.isWorkerRunning ? (
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

      {/* Current Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outside Temp</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanData?.outsideTemp?.toFixed(1)}°C</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inside Temp</CardTitle>
            <HugeiconsIcon icon={TemperatureIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{oumanData?.insideTemp?.toFixed(1)}°C</div>
            <p className="text-xs text-muted-foreground">
              Target: {oumanData?.insideTempDemand?.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Heat Pump</CardTitle>
            <HugeiconsIcon icon={DropletIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{heishaData?.targetTemp}°C</div>
            <p className="text-xs text-muted-foreground">
              In: {heishaData?.inletTemp?.toFixed(1)}°C / Out: {heishaData?.outletTemp?.toFixed(1)}°C
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oil Burner</CardTitle>
            <HugeiconsIcon icon={FireIcon} className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {oilBurnerData?.isRunning ? (
                <Badge variant="default">Running</Badge>
              ) : (
                <Badge variant="secondary">Off</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Temperature Override */}
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

      {/* Electric Water Heater Control */}
      <Card>
        <CardHeader>
          <CardTitle>Electric Water Heater (EM)</CardTitle>
          <CardDescription>Control water heating system</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              {emData?.isOn ? (
                <Badge variant="default">On</Badge>
              ) : (
                <Badge variant="secondary">Off</Badge>
              )}
            </div>
            {emData?.isRunning && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Running:</span>
                <Badge variant="default" className="gap-1">
                  <HugeiconsIcon icon={Lightning} className="h-3 w-3" />
                  Active
                </Badge>
              </div>
            )}
            {emOverrideStatus?.isOverrideActive && (
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-3">
                <p className="text-sm text-orange-800">
                  Override active until {new Date(emOverrideStatus.overrideUntil).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex gap-2">
              <Button
                onClick={() => handleEMControl('enable')}
                disabled={loading}
                variant="default"
              >
                Enable
              </Button>
              <Button
                onClick={() => handleEMControl('disable')}
                disabled={loading}
                variant="outline"
              >
                Disable
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emHours">Override Duration (hours)</Label>
              <Input
                id="emHours"
                type="number"
                value={emHours}
                onChange={(e: {target: {value: any;};}) => setEmHours(Number(e.target.value))}
                min={1}
                max={24}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleEMOverride('enable')}
                disabled={loading}
                variant="secondary"
              >
                Override Enable
              </Button>
              <Button
                onClick={() => handleEMOverride('disable')}
                disabled={loading}
                variant="secondary"
              >
                Override Disable
              </Button>
              {emOverrideStatus?.isOverrideActive && (
                <Button
                  onClick={handleClearEMOverride}
                  disabled={loading}
                  variant="outline"
                >
                  Clear Override
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Oil Burner Control */}
      <Card>
        <CardHeader>
          <CardTitle>Oil Burner Control</CardTitle>
          <CardDescription>Manual control for backup heating</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              onClick={() => handleOilBurnerControl('enable')}
              disabled={loading}
              variant="default"
            >
              <HugeiconsIcon icon={FireIcon} className="mr-2 h-4 w-4" />
              Enable
            </Button>
            <Button
              onClick={() => handleOilBurnerControl('disable')}
              disabled={loading}
              variant="outline"
            >
              Disable
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* TRV Status */}
      {trvData?.devices && trvData.devices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Thermostatic Radiator Valves</CardTitle>
            <CardDescription>Status of radiator controls</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {trvData.devices.map((trv: any, idx: number) => (
                <div key={idx} className="rounded-lg border p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{trv.name}</h4>
                    <Badge variant={trv.status === 0 ? 'default' : 'secondary'}>
                      {trv.status === 0 ? 'OK' : 'Issue'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1">
                      <HugeiconsIcon icon={BatteryFullIcon} className="h-3 w-3" />
                      <span>{trv.batteryLevel}%</span>
                    </div>
                    <p>Level: {trv.latestLevel?.toFixed(1)}%</p>
                    <p>Auto: {trv.autoTemperature ? 'Yes' : 'No'}</p>
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