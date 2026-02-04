import {HubConnection} from '@microsoft/signalr';
import {useEffect, useRef, useState} from 'react';
import {backendUrl, electricityUrl} from '../config/config';
import {ConsumptionData, consumptionDataSchema, ConsumptionKeys, translateKey, translateUnit, validConsumptionKeys} from '../lib/electricity/validation/consumptionData';
import {useIsAuthenticated} from '@azure/msal-react';
import {useNavigate} from 'react-router-dom';
import {ElectricityClient} from '../lib/electricity/electricityClient';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from './ui/card';
import {Badge} from './ui/badge';
import {LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer} from 'recharts';
import {useAuth} from '../contexts/AuthContext';

const cumulativePowerConsumption: ConsumptionKeys[] = ['CumulativePowerConsumption'];
const cumulativePowerYield: ConsumptionKeys[] = ['CumulativePowerYield'];
const actualKeys: ConsumptionKeys[] = ['ActualConsumption', 'ActualReturndelivery'];
const voltageKeys: ConsumptionKeys[] = ['L1Voltage', 'L2Voltage', 'L3Voltage'];
const currentKeys: ConsumptionKeys[] = ['L1InstantPowerCurrent', 'L2InstantPowerCurrent', 'L3InstantPowerCurrent'];
const otherKeys: ConsumptionKeys[] = validConsumptionKeys.filter(
  key => !actualKeys.includes(key) && key !== 'CumulativePowerConsumption' && key !== 'CumulativePowerYield' && !voltageKeys.includes(key)
);
const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7c7c', '#8dd1e1', '#d884d8', '#ca9d82', '#58c6ff'];

function ElectricityConsumption() {
  const connection = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [latestConsumptionData, setLatestConsumptionData] = useState<ConsumptionData | null>(null);
  const [historyData, setHistoryData] = useState<ConsumptionData[] | null>(null);
  const isAuthenticated = useIsAuthenticated();
  const {isReady} = useAuth();
  const navigate = useNavigate();
  const eClientRef = useRef<ElectricityClient | null>(null);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!eClientRef.current) {
      eClientRef.current = new ElectricityClient(backendUrl);
    }
  }, [isReady, isAuthenticated, navigate]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !eClientRef.current) {
      return;
    }

    const currentConnection = connection.current;

    if (!currentConnection) {
      setConnectionStatus(`Connecting to ${electricityUrl}`);

      const setupConnection = async () => {
        try {
          const hubConnection = await eClientRef.current!.getElectricityHubConnection();

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
          setConnectionStatus(`Connected to ${hubConnection.baseUrl}`);
          connection.current = hubConnection;
        } catch (error) {
          console.log('hubConnection failed', error);
          setConnectionStatus(`Connection failed to ${electricityUrl}, due to ${error}`);
        }
      };

      void setupConnection();
    }

    return () => {
      if (currentConnection) {
        void currentConnection.stop();
      }
    };
  }, [isReady, isAuthenticated]);

  useEffect(() => {
    if (!isReady || !isAuthenticated || !eClientRef.current) {
      return;
    }

    const fetchHistoryData = async () => {
      try {
        const historyData = await eClientRef.current!.getHistoryData();
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
  }, [isReady, isAuthenticated]);

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
        if (voltageKeys.includes(key)) {
          return [translateKey(key), value / 1000];
        }
        if (key.includes('Current')) {
          return [translateKey(key), value / 1000];
        }
        if (key.includes('Cumulative')) {
          return [translateKey(key), value / 1000];
        }
        return [translateKey(key), value];
      })
    )
  })) || [];

  const getChartFormatter = (keys: ConsumptionKeys[]) => {
    const isVoltageChart = keys.every(key => voltageKeys.includes(key));
    const isCurrentChart = keys.some(key => currentKeys.includes(key));
    const isCumulativeChart = keys.some(key => key.includes('Cumulative'));

    if (isVoltageChart) {
      return {
        domain: [220, 240] as [number, number],
        tickFormatter: (value: number) => `${value.toFixed(0)}V`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} V`
      };
    }
    if (isCurrentChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        tickFormatter: (value: number) => `${value.toFixed(1)}A`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} A`
      };
    }
    if (isCumulativeChart) {
      return {
        domain: ['auto', 'auto'] as ['auto', 'auto'],
        tickFormatter: (value: number) => `${value.toFixed(0)}kWh`,
        tooltipFormatter: (value: number) => `${value.toFixed(2)} kWh`
      };
    }
    return {
      domain: ['auto', 'auto'] as ['auto', 'auto'],
      tickFormatter: undefined,
      tooltipFormatter: (value: number) => `${value.toFixed(2)}`
    };
  };

  const renderChart = (title: string, description: string, keys: ConsumptionKeys[]) => {
    const formatter = getChartFormatter(keys);

    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
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
                <Legend
                  wrapperStyle={{
                    paddingTop: '20px'
                  }}
                />
                {keys.map((key, index) => (
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
    );
  };

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

      {renderChart(
        'Actual Consumption & Return Delivery',
        `Current power usage and return delivery (${historyData?.length || 0} data points)`,
        actualKeys
      )}
      {renderChart(
        'Cumulative Power Consumption',
        `Total energy consumption over time (${historyData?.length || 0} data points)`,
        cumulativePowerConsumption
      )}
      {renderChart(
        'Cumulative Power Yield',
        `Total energy yield over time (${historyData?.length || 0} data points)`,
        cumulativePowerYield
      )}
      {renderChart(
        'Power Details',
        `Detailed power usage, current, and voltage per phase (${historyData?.length || 0} data points)`,
        otherKeys
      )}
      {renderChart(
        'Voltage Details',
        `Detailed voltage per phase (${historyData?.length || 0} data points)`,
        voltageKeys
      )}
    </div>
  );
}

export default ElectricityConsumption;
