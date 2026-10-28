import {Badge} from '../ui/badge';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {formatDateTimeFi} from '../../lib/dateTimeFormat';
import {formatConsumptionReading} from '../../lib/electricity/consumptionDisplay';
import {translateKey, validConsumptionKeys} from '../../lib/electricity/validation/consumptionData';
import {useAppSelector} from '../../store/hooks';

export default function ElectricityCurrentReading() {
  const {connectionStatus, latestConsumptionData, mqStatus, mqStatusUpdatedAt} = useAppSelector(
    (state) => state.electricity
  );

  const getStatusVariant = () => {
    if (connectionStatus.includes('Connected')) return 'default';
    if (connectionStatus.includes('Connecting')) return 'secondary';
    return 'destructive';
  };

  const getMqStatusVariant = () => {
    const status = mqStatus === null ? '' : String(mqStatus).toLowerCase();
    if (!status) return 'secondary';
    if (
      status.includes('ok') ||
      status.includes('healthy') ||
      status.includes('connected') ||
      status.includes('running') ||
      status.includes('up')
    ) {
      return 'default';
    }

    return 'destructive';
  };

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Current electricity reading</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStatusVariant()} className="text-sm">
            {connectionStatus}
          </Badge>

          <Badge variant={getMqStatusVariant()} className="text-sm">
            MQ: {mqStatus === null ? 'Unknown' : String(mqStatus)}
            {mqStatusUpdatedAt ? ` (updated ${formatDateTimeFi(mqStatusUpdatedAt)})` : ''}
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
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
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
    </div>
  );
}
