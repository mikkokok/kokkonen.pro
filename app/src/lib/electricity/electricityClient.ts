import {getAuthResponse} from "../auth/msal";
import {handleFetch} from "../fetchUtils";
import {consumptionDataSchema} from "./validation/consumptionData";
import {TaskResponse, taskResponseSchema} from "./validation/taskResponse";
import {HubConnection, HubConnectionBuilder, LogLevel} from '@microsoft/signalr';

export class ElectricityClient {
  private baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async getTaskStatus(): Promise<TaskResponse> {
    const request = new Request(`${this.baseUrl}api/electricity/task`, {method: 'GET'});
    const response = await handleFetch(request);
    return taskResponseSchema.parse(await response.json());
  }

  public async getHistoryData() {
    const request = new Request(`${this.baseUrl}api/electricity/consumption/history`, {method: 'GET'});
    const response = await handleFetch(request);
    return consumptionDataSchema.array().parse(await response.json());
  }

  public async getElectricityHubConnection(): Promise<HubConnection> {
    const authResponse = await getAuthResponse();
    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}api/electricity/consumption`, {accessTokenFactory: () => authResponse.accessToken})
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    return hubConnection;
  }
}