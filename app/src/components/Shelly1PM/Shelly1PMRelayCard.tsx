import {FormEvent, useCallback, useEffect, useMemo, useState} from 'react';
import {HugeiconsIcon, type IconSvgElement} from '@hugeicons/react';
import {Delete02Icon} from '@hugeicons/core-free-icons';
import {backendUrl} from '../../config/config';
import {Shelly1PMClient} from '../../lib/shelly1pm/shelly1PMClient';
import {Shelly1PMDeviceName} from '../../lib/shelly1pm/types/shelly1PMDeviceName';
import type {Shelly1PMDevice} from '../../lib/shelly1pm/validation/shelly1PMDevice';
import type {Shelly1PMRelaySettingsResponse} from '../../lib/shelly1pm/validation/shelly1PMRelaySettingsResponse';
import {devLog} from '../../lib/logger';
import {Badge} from '../ui/badge';
import {Button} from '../ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Input} from '../ui/input';
import {Label} from '../ui/label';

interface Shelly1PMRelayCardProps {
  deviceName: Shelly1PMDeviceName;
  title: string;
  icon: IconSvgElement;
  onIconClassName?: string;
}

export default function Shelly1PMRelayCard({
  deviceName,
  title,
  icon,
  onIconClassName = 'text-yellow-400',
}: Shelly1PMRelayCardProps) {
  const client = useMemo(() => new Shelly1PMClient(backendUrl), []);
  const [device, setDevice] = useState<Shelly1PMDevice | undefined>(undefined);
  const [settings, setSettings] = useState<Shelly1PMRelaySettingsResponse | undefined>(undefined);
  const [newSchedule, setNewSchedule] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [devices, relaySettings] = await Promise.all([
        client.getDevices(),
        client.getRelaySettings(deviceName),
      ]);
      setDevice(devices.find((d) => d.name === deviceName));
      setSettings(relaySettings);
      setError(null);
    } catch (e) {
      devLog(`Failed to fetch ${title} state`, e);
      setError(`Failed to load ${title} state`);
    }
  }, [client, deviceName, title]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const runAction = async (action: () => Promise<unknown>, errorMessage: string) => {
    setLoading(true);
    try {
      await action();
      setError(null);
    } catch (e) {
      devLog(errorMessage, e);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setRelay = (turnOn: boolean) =>
    runAction(async () => {
      await client.setRelay(deviceName, turnOn);
      await refresh();
    }, `Failed to turn ${title} ${turnOn ? 'on' : 'off'}`);

  const addSchedule = (event: FormEvent) => {
    event.preventDefault();
    const schedule = newSchedule.trim();
    if (!schedule) return;

    void runAction(async () => {
      setSettings(await client.addRelaySchedule(deviceName, schedule));
      setNewSchedule('');
    }, 'Failed to add schedule');
  };

  const removeSchedule = (schedule: string) =>
    runAction(async () => {
      setSettings(await client.removeRelaySchedule(deviceName, schedule));
    }, 'Failed to remove schedule');

  const isOn = device?.relayStatus ?? settings?.ison;
  const scheduleRules = settings?.schedule_rules ?? [];
  const scheduleInputId = `shelly1pm-${deviceName}-schedule`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HugeiconsIcon icon={icon} className={`h-5 w-5 ${isOn ? onIconClassName : 'text-muted-foreground'}`} />
          {title}
        </CardTitle>
        <CardDescription>{device?.ipAddress ?? '—'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Relay</span>
            <Badge variant={isOn === undefined ? 'secondary' : isOn ? 'default' : 'destructive'}>
              {isOn === undefined ? 'Unknown' : isOn ? 'On' : 'Off'}
            </Badge>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => void setRelay(true)} disabled={loading || isOn === true}>
              <HugeiconsIcon icon={icon} className="mr-2 h-4 w-4" />
              Turn on
            </Button>
            <Button variant="outline" onClick={() => void setRelay(false)} disabled={loading || isOn === false}>
              Turn off
            </Button>
          </div>
        </div>

        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Schedules</span>
            <Badge variant={settings?.schedule ? 'default' : 'secondary'}>
              {settings?.schedule ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>

          {scheduleRules.length > 0 ? (
            <ul className="space-y-1">
              {scheduleRules.map((rule) => (
                <li key={rule} className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-mono">{rule}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove schedule ${rule}`}
                    onClick={() => void removeSchedule(rule)}
                    disabled={loading}
                  >
                    <HugeiconsIcon icon={Delete02Icon} className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No schedules</p>
          )}

          <form onSubmit={addSchedule} className="space-y-2">
            <Label htmlFor={scheduleInputId}>New schedule</Label>
            <div className="flex gap-2">
              <Input
                id={scheduleInputId}
                placeholder="e.g. 2000-0123456-on"
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || !newSchedule.trim()}>
                Add
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Format: HHMM-weekdays-on|off (weekdays 0 = Monday … 6 = Sunday)</p>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
