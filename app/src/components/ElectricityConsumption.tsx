import {HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';
import {useEffect, useRef, useState} from 'react';
import {backendUrl, electricityUrl} from '../config/config';
import {ConsumptionData, consumptionDataSchema, translateKey, translateUnit, validConsumptionKeys} from '../lib/electricity/validation/consumptionData';
import {useAccount} from '@azure/msal-react';
import {useNavigate} from 'react-router-dom';
import {getAuthResponse, getMsalInstance, loginRequest} from '../lib/auth/msal';
import {ElectricityClient} from '../lib/electricity/electricityClient';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {Badge} from './ui/badge';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';

function ElectricityConsumption() {
  const connection = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [latestConsumptionData, setLatestConsumptionData] = useState<ConsumptionData | null>(null);
  const [historyData, setHistoryData] = useState<ConsumptionData[] | null>(null);
  const account = useAccount();
  const navigate = useNavigate();
  const msalInstance = getMsalInstance();
  const eClient = new ElectricityClient(backendUrl);

  useEffect(() => {
    const currentConnection = connection.current;

    if (!account) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      navigate('/login');
      return;
    }

    if (!currentConnection) {
      setConnectionStatus(`Connecting to ${electricityUrl}`);
      const fetchApiToken = async () => {
        try {
          const apiToken = await getAuthResponse();
          return apiToken.accessToken;
        } catch (error) {
          console.log('APIToken fetch failed', error);
          throw error;
        }
      };

      const hubConnection = new HubConnectionBuilder()
        .withUrl(electricityUrl, {accessTokenFactory: fetchApiToken})
        .withAutomaticReconnect()
        .configureLogging(LogLevel.Information)
        .build();

      hubConnection.on('broadcastConsumptionData', (data: ConsumptionData) => {
        try {
          const validatedData = consumptionDataSchema.parse(data);
          setLatestConsumptionData(validatedData);
        } catch (error) {
          console.log('error in validation', error);
          setLatestConsumptionData(null);
        }
      });

      const startHubConn = async () => {
        try {
          await hubConnection.start();
          console.log('hubConnection started');
          setConnectionStatus(`Connected to ${electricityUrl}`);
        } catch (error) {
          console.log('hubConnection failed', error);
          setConnectionStatus(`Connection failed to ${electricityUrl}, due to ${error}`);
        }
      };
      void startHubConn();
      connection.current = hubConnection;
    }
  }, [latestConsumptionData, connectionStatus, account, navigate]);

  useEffect(() => {
    const fetchHistoryData = async () => {
      try {
        const historyData = await eClient.getHistoryData();
        setHistoryData(historyData);
        console.log('History data:', historyData);
      } catch (error) {
        console.log('Failed to fetch history data', error);
      }
    };

    void fetchHistoryData();

    const intervalId = setInterval(() => {
      void fetchHistoryData();
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, []);

  const getStatusVariant = () => {
    if (connectionStatus.includes('Connected')) return 'default';
    if (connectionStatus.includes('Connecting')) return 'secondary';
    return 'destructive';
  };

  const chartData = historyData?.map((record) => ({
    timestamp: new Date(record.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    ...Object.fromEntries(
      validConsumptionKeys.map(key => [translateKey(key), record.data[key]])
    )
  })) || [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1'];

  return (
    <div className="p-6 space-y-6 w-full max-w-7xl mx-auto dark">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Electricity Consumption</h1>
        <Badge variant={getStatusVariant()} className="text-sm">
          {connectionStatus}
        </Badge>
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

      <Card>
        <CardHeader>
          <CardTitle>History</CardTitle>
          <CardDescription>
            Consumption trends over time ({historyData?.length || 0} data points)
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem'
                  }}
                  labelStyle={{color: 'hsl(var(--foreground))'}}
                />
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
                {validConsumptionKeys.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={translateKey(key)}
                    stroke={colors[index % colors.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{r: 4}}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground">Loading history data...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default ElectricityConsumption;
