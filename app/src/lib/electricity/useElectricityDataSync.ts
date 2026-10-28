import {InteractionStatus} from '@azure/msal-browser';
import {useMsal} from '@azure/msal-react';
import {useEffect, useRef} from 'react';
import {backendUrl} from '../../config/config';
import {devLog} from '../logger';
import {consumptionDataSchema} from './validation/consumptionData';
import {
  electricityClient,
  fetchHistoryData,
  fetchMqStatus,
  fetchSpotPrices,
  setConnectionStatus,
  setLatestConsumptionData,
} from '../../store/electricitySlice';
import {useAppDispatch} from '../../store/hooks';
import type {HubConnection} from '@microsoft/signalr';

export function useElectricityDataSync() {
  const dispatch = useAppDispatch();
  const {accounts, inProgress} = useMsal();
  const connection = useRef<HubConnection | null>(null);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    const connectionUrl = `${backendUrl}api/electricity/consumption`;
    if (connection.current) {
      return;
    }

    let isDisposed = false;
    dispatch(setConnectionStatus(`Connecting to ${connectionUrl}`));

    const setupConnection = async () => {
      try {
        const hubConnection = await electricityClient.getElectricityHubConnection();

        hubConnection.on('broadcastConsumptionData', (data: unknown) => {
          try {
            const validatedData = consumptionDataSchema.parse(data);
            dispatch(setLatestConsumptionData(validatedData));
          } catch (error) {
            devLog('error in validation', error);
            dispatch(setLatestConsumptionData(null));
          }
        });

        await hubConnection.start();
        if (isDisposed) {
          await hubConnection.stop();
          return;
        }

        devLog('hubConnection started');
        connection.current = hubConnection;
        dispatch(setConnectionStatus(`Connected to ${connectionUrl}`));
      } catch (error) {
        devLog('hubConnection failed', error);
        dispatch(setConnectionStatus(`Connection failed to ${connectionUrl}, due to ${String(error)}`));
      }
    };

    void setupConnection();

    return () => {
      isDisposed = true;

      if (connection.current) {
        const activeConnection = connection.current;
        connection.current = null;
        void activeConnection.stop();
      }

      dispatch(setConnectionStatus('Disconnected'));
    };
  }, [accounts.length, dispatch, inProgress]);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    void dispatch(fetchMqStatus(true));

    const intervalId = window.setInterval(() => {
      void dispatch(fetchMqStatus(true));
    }, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [accounts.length, dispatch, inProgress]);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    // Refetch once history is loaded so the price range covers all history.
    void dispatch(fetchHistoryData(true)).finally(() => {
      void dispatch(fetchSpotPrices(true));
    });

    const intervalId = window.setInterval(() => {
      void dispatch(fetchHistoryData(true));
    }, 5 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [accounts.length, dispatch, inProgress]);

  useEffect(() => {
    if (inProgress !== InteractionStatus.None) {
      return;
    }
    if (accounts.length === 0) {
      return;
    }

    void dispatch(fetchSpotPrices(true));

    const intervalId = window.setInterval(() => {
      void dispatch(fetchSpotPrices(true));
    }, 15 * 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [accounts.length, dispatch, inProgress]);

  return {
    isAuthInitializing: inProgress !== InteractionStatus.None,
  };
}
