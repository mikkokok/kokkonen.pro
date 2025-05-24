import {HubConnection, HubConnectionBuilder, HubConnectionState, LogLevel} from '@microsoft/signalr';
import {useEffect, useRef, useState} from 'react';
import {apiScopes, electricityUrl} from '../config/config';
import {ConsumptionData, consumptionDataSchema} from '../types/electricity/consumptionData';
import {useAccount, useMsal} from '@azure/msal-react';

function Electricity() {
  const connection = useRef<HubConnection | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('Disconnected');
  const [latestConsumptionData, setLatestConsumptionData] = useState<ConsumptionData | null>(null);
  const account = useAccount();
  const {instance} = useMsal();

  useEffect(() => {
    const currentConnection = connection.current;

    if (!currentConnection) {
      setConnectionStatus(`Connecting to ${electricityUrl}`);
      if (!account) {
        throw 'error no account';
      }
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
        console.log('got data', data);
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
  }, [latestConsumptionData, connectionStatus, account, instance]);

  return (
    <div>
      <div>Electricity! {connectionStatus}</div>
      <div>Updated: {latestConsumptionData?.timestamp}</div>
      <div>Updated: {latestConsumptionData?.data.ActualConsumption}</div>
    </div>
  );
}

export default Electricity;
