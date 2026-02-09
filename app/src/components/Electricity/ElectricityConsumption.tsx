import {HubConnection} from '@microsoft/signalr';
import {useEffect, useMemo, useRef, useState} from 'react';
import {backendUrl} from '../../config/config';
import {
  ConsumptionData,
  consumptionDataSchema,
  ConsumptionKeys,
  translateKey,
  translateUnit,
  validConsumptionKeys
} from '../../lib/electricity/validation/consumptionData';
import {useIsAuthenticated} from '@azure/msal-react';
import {useNavigate} from 'react-router-dom';
import {ElectricityClient} from '../../lib/electricity/electricityClient';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '../ui/card';
import {Badge} from '../ui/badge';
import {Checkbox} from '../ui/checkbox';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {useAuth} from '../../contexts/AuthContext';
import {convertMQStatusEnumToString} from '../../lib/electricity/validation/mqResponse';

const actualKeys: ConsumptionKeys[] = ['ActualConsumption', 'ActualReturndelivery'];
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d884d8', '#ca9d82', '#58c6ff'];

function ElectricityConsumption() {
  const connection = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [latestConsumptionData, setLatestConsumptionData] = useState<ConsumptionData | null>(null);
  const [historyData, setHistoryData] = useState<ConsumptionData[] | null>(null);

  const [mqStatus, setMqStatus] = useState<string | null>(null);
  const [mqStatusUpdatedAt, setMqStatusUpdatedAt] = useState<string | null>(null);

  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>(
    Object.fromEntries(validConsumptionKeys.map(key => [key, true]))
  );

  const isAuthenticated = useIsAuthenticated();
  const {isReady} = useAuth();
  const navigate = useNavigate();
  const electricityClient = useMemo(() => new ElectricityClient(backendUrl), []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (!isReady) {
      return;
    }

    const currentConnection = connection.current;
    const connectionUrl = `${backendUrl}api/electricity/consumption`;

    if (!currentConnection) {
      setConnectionStatus(`Connecting to ${connectionUrl}`);

      const setupConnection = async () => {
        try {
          const hubConnection = await electricityClient.getElectricityHubConnection();

          hubConnection.on('broadcastConsumptionData', (data: ConsumptionData) => {
            try {
              const validatedData = consumptionDataSchema.parse(data);
              setLatestConsumptionData(validatedData);
            } catch (error) {
              console.log('error in validation', error);
              setLatestConsumptionData(null);
            }
          });

          await hubConnection.start();
          console.log('hubConnection started');
          setConnectionStatus(`Connected to ${connectionUrl}`);
          connection.current = hubConnection;
        } catch (error) {
          console.log('hubConnection failed', error);
          setConnectionStatus(`Connection failed to ${connectionUrl}, due to ${error}`);
        }
      };

      void setupConnection();
    }

    return () => {
      if (currentConnection) {
        void currentConnection.stop();
      }
    };
  }, [isReady, isAuthenticated, navigate, electricityClient]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    const fetchMqStatus = async () => {
      try {
        const status = await electricityClient.getMQStatus();
        setMqStatus(convertMQStatusEnumToString(status));
        setMqStatusUpdatedAt(new Date().toLocaleString('fi-FI'));
      } catch (error) {
        console.log('Failed to fetch MQ status', error);
        setMqStatus(null);
        setMqStatusUpdatedAt(new Date().toLocaleString('fi-FI'));
      }
    };

    void fetchMqStatus();

    const intervalId = setInterval(() => {
      void fetchMqStatus();
    }, 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isReady, isAuthenticated, electricityClient]);

  useEffect(() => {
    if (!isReady || !isAuthenticated) {
      return;
    }

    const fetchHistoryData = async () => {
      try {
        const historyData = await electricityClient.getHistoryData();
        setHistoryData(historyData);
      } catch (error) {
        console.log('Failed to fetch history data', error);
      }
    };

    void fetchHistoryData();

    const intervalId = setInterval(() => {
      void fetchHistoryData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [isReady, isAuthenticated, electricityClient]);

  if (!isReady) {
    return (
      <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
        <p className="text-sm text-muted-foreground">Initializing authentication...</p>
      </div>
    );
  }

  const getStatusVariant = () => {
    if (connectionStatus.includes('Connected')) return 'default';
    if (connectionStatus.includes('Connecting')) return 'secondary';
    return 'destructive';
  };

  const getMqStatusVariant = () => {
    const s = mqStatus === null ? '' : String(mqStatus).toLowerCase();
    if (!s) return 'secondary';
    if (s.includes('ok') || s.includes('healthy') || s.includes('connected') || s.includes('running') || s.includes('up')) return 'default';
    return 'destructive';
  };

  const chartData = historyData?.map((record) => ({
    timestamp: new Date(record.timestamp).toLocaleString('fi-FI', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    ...Object.fromEntries(
      validConsumptionKeys.map(key => {
        const value = record.data[key];
        if (value === undefined) {
          return [translateKey(key), undefined];
        }
        if (key.includes('Current')) {
          return [translateKey(key), value / 1000];
        }
        return [translateKey(key), value];
      })
    )
  })) || [];

  const getChartFormatter = (keys: ConsumptionKeys[]) => {
    return {
      domain: ['auto', 'auto'] as ['auto', 'auto'],
      tickFormatter: undefined,
      tooltipFormatter: (value: number) => `${value.toFixed(2)}`
    };
  };

  const toggleLine = (key: ConsumptionKeys) => {
    setVisibleLines(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderChart = (title: string, description: string, keys: ConsumptionKeys[], showToggles = false) => {
    const formatter = getChartFormatter(keys);

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
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="timestamp"
                  className="text-xs"
                  tick={{fill: 'hsl(var(--muted-foreground))'}}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  className="text-xs"
                  tick={{fill: 'hsl(var(--muted-foreground))'}}
                  domain={formatter.domain}
                  tickFormatter={formatter.tickFormatter}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                  formatter={(value: number | undefined) =>
                    value !== undefined ? formatter.tooltipFormatter(value) : 'N/A'
                  }
                />
                <Legend wrapperStyle={{paddingTop: '20px'}} />
                {keys.map((key, index) => (
                  visibleLines[key] && (
                    <Line
                      key={key}
                      type="monotone"
                      dataKey={translateKey(key)}
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{r: 4}}
                    />
                  )
                ))}
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

        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={getStatusVariant()} className="text-sm">
            {connectionStatus}
          </Badge>

          <Badge variant={getMqStatusVariant()} className="text-sm">
            MQ: {mqStatus === null ? 'Unknown' : String(mqStatus)}
            {mqStatusUpdatedAt ? ` (updated ${mqStatusUpdatedAt})` : ''}
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current Reading</CardTitle>
          <CardDescription>
            Last updated: {latestConsumptionData?.timestamp || 'N/A'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestConsumptionData ? (
            <div className="space-y-3">
              {validConsumptionKeys.map((key) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium">{translateKey(key)}</span>
                  <span className="text-sm text-muted-foreground">
                    {latestConsumptionData.data[key]} {translateUnit(key)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Waiting for data...</p>
          )}
        </CardContent>
      </Card>

      {renderChart(
        'Actual Consumption & Return Delivery',
        `Current power usage and return delivery (${historyData?.length || 0} data points)`,
        actualKeys
      )}
    </div>
  );
}

export default ElectricityConsumption;
