import {useCallback, useEffect, useMemo, useState} from 'react';

import {backendUrl} from '../config/config';
import {HeatHarmonyClient} from '../lib/heatHarmony/heatHarmonyClient';
import {HeatAutomationStatusResponse} from '../lib/heatHarmony/validation/heatAutomationStatus';
import {HeatAutomationTaskResponse} from '../lib/heatHarmony/validation/heatAutomationTaskResponse';
import {HeishamonTaskResponse} from '../lib/heatHarmony/validation/heishamonTaskResponse';
import {OumanTaskResponse} from '../lib/heatHarmony/validation/oumanTaskResponse';
import {PingResponse} from '../lib/heatHarmony/validation/pingStatus';
import {TrvTaskResponse} from '../lib/heatHarmony/validation/trvTaskResponse';
import {formatDateTimeFi} from '../lib/dateTimeFormat';
import {Badge} from './ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {Separator} from './ui/separator';

function renderErrors(errors: string[] | null | undefined) {
  if (!errors || errors.length === 0) return null;
  return (
    <div className="space-y-1">
      {errors.slice(0, 5).map((e, idx) => (
        <p key={idx} className="text-xs text-muted-foreground">
          {e}
        </p>
      ))}
      {errors.length > 5 && (
        <p className="text-xs text-muted-foreground">...and {errors.length - 5} more</p>
      )}
    </div>
  );
}

export function HomeHeatingTaskStatuses() {
  const [heatAutomationPingStatus, setHeatAutomationPingStatus] = useState<PingResponse>({status: null, serverTime: undefined});
  const [heatAutomationStatus, setHeatAutomationStatus] = useState<HeatAutomationStatusResponse | undefined>(undefined);
  const [heatAutomationTaskStatus, setHeatAutomationTaskStatus] = useState<HeatAutomationTaskResponse | undefined>(undefined);
  const [oumanTaskStatus, setOumanTaskStatus] = useState<OumanTaskResponse | undefined>(undefined);
  const [heishamonTaskStatus, setHeishamonTaskStatus] = useState<HeishamonTaskResponse | undefined>(undefined);
  const [trvTaskStatus, setTrvTaskStatus] = useState<TrvTaskResponse | undefined>(undefined);

  const heatHarmonyClient = useMemo(() => new HeatHarmonyClient(backendUrl), []);

  const fetchData = useCallback(async () => {
    const safe = async <T,>(label: string, request: Promise<T>): Promise<T | undefined> => {
      try {
        return await request;
      } catch (error) {
        console.warn(`HeatHarmony task-status fetch failed (${label}):`, error);
        return undefined;
      }
    };

    const [
      ping,
      automationStatus,
      automationTaskStatus,
      oumanTask,
      heishamonTask,
      trvTask,
    ] = await Promise.all([
      safe('ping', heatHarmonyClient.getPingStatus()),
      safe('heatAutomationStatus', heatHarmonyClient.getHeatAutomationStatus()),
      safe('heatAutomationTaskStatus', heatHarmonyClient.getHeatAutomationTaskStatus()),
      safe('oumanTaskStatus', heatHarmonyClient.getOumanTaskStatus()),
      safe('heishamonTaskStatus', heatHarmonyClient.getHeishamonTaskStatus()),
      safe('trvTaskStatus', heatHarmonyClient.getTrvTaskStatus()),
    ]);

    if (ping) setHeatAutomationPingStatus(ping);
    if (automationStatus) setHeatAutomationStatus(automationStatus);
    if (automationTaskStatus) setHeatAutomationTaskStatus(automationTaskStatus);
    if (oumanTask) setOumanTaskStatus(oumanTask);
    if (heishamonTask) setHeishamonTaskStatus(heishamonTask);
    if (trvTask) setTrvTaskStatus(trvTask);
  }, [heatHarmonyClient]);

  useEffect(() => {
    void fetchData();
    const interval = setInterval(() => {
      void fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatDateTime = (value: string | undefined) => formatDateTimeFi(value);

  return (
    <div className="space-y-6 dark">
      <h1 className="text-3xl font-bold">Task Statuses</h1>

      <Card>
        <CardHeader>
          <CardTitle>HeatHarmony Scheduled Tasks</CardTitle>
          <CardDescription>Automation scheduler statuses and errors</CardDescription>
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
                  {heatAutomationTaskStatus?.oumanAndHeishamonSync.status ?? '-'}
                </Badge>
              </div>
              {renderErrors(heatAutomationTaskStatus?.oumanAndHeishamonSync.errors)}
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Water heating by price</span>
                <Badge variant={heatAutomationTaskStatus?.setUseWaterBasedOnPrice.status === 'Ok' ? 'default' : 'secondary'}>
                  {heatAutomationTaskStatus?.setUseWaterBasedOnPrice.status ?? '-'}
                </Badge>
              </div>
              {renderErrors(heatAutomationTaskStatus?.setUseWaterBasedOnPrice.errors)}
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Inside temp by price</span>
                <Badge variant={heatAutomationTaskStatus?.setInsideTempBasedOnPrice.status === 'Ok' ? 'default' : 'secondary'}>
                  {heatAutomationTaskStatus?.setInsideTempBasedOnPrice.status ?? '-'}
                </Badge>
              </div>
              {renderErrors(heatAutomationTaskStatus?.setInsideTempBasedOnPrice.errors)}
            </div>
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
                  {oumanTaskStatus?.status ?? '-'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">serverTime: {formatDateTime(oumanTaskStatus?.serverTime)}</div>
              {renderErrors(oumanTaskStatus?.errors)}
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Heishamon task</span>
                <Badge variant={heishamonTaskStatus?.status === 'Ok' ? 'default' : 'secondary'}>
                  {heishamonTaskStatus?.status ?? '-'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">serverTime: {formatDateTime(heishamonTaskStatus?.serverTime)}</div>
              {renderErrors(heishamonTaskStatus?.errors)}
            </div>

            <div className="rounded-lg border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">TRV task</span>
                <Badge variant={trvTaskStatus?.status === 'Ok' ? 'default' : 'secondary'}>
                  {trvTaskStatus?.status ?? '-'}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">serverTime: {formatDateTime(trvTaskStatus?.serverTime)}</div>
              {renderErrors(trvTaskStatus?.errors)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default HomeHeatingTaskStatuses;
