import {HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';
import {useEffect, useRef, useState} from 'react';
import {apiScopes, electricityUrl} from '../config/config';
import {ConsumptionData, consumptionDataSchema, translateKey, validConsumptionKeys} from '../types/electricity/consumptionData';
import {useAccount, useMsal} from '@azure/msal-react';
import {useNavigate} from 'react-router-dom';

function Electricity() {
  const connection = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [latestConsumptionData, setLatestConsumptionData] = useState<ConsumptionData | null>(null);
  const account = useAccount();
  const {instance} = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    const currentConnection = connection.current;

    if (!currentConnection) {
      if (!account) {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        navigate('/');
        return;
      }
      setConnectionStatus(`Connecting to ${electricityUrl}`);
      const fetchApiToken = async () => {
        try {
          const apiToken = await instance.acquireTokenSilent({
            scopes: apiScopes,
            account: account,
          });
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
          setConnectionStatus(`Connection failed to ${electricityUrl}`);
        }
      };
      void startHubConn();
      connection.current = hubConnection;
    }
  }, [latestConsumptionData, connectionStatus, account, instance, navigate]);

  return (
    <div>
      <h2>Electricity consumption</h2>
      <div>{connectionStatus}</div>
      <div>Updated: {latestConsumptionData?.timestamp}</div>
      {latestConsumptionData &&
        validConsumptionKeys.map((key) => (
          <div key={key}>
            {translateKey(key)}: {latestConsumptionData.data[key]}
          </div>
        ))}
    </div>
  );
}

export default Electricity;
