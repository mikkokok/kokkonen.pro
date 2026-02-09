import {getAuthResponse} from "../auth/msal";
import {handleFetch} from "../fetchUtils";
import {MQStatusEnum} from "./types/mqStatusEnum";
import {ConsumptionData, consumptionDataSchema} from "./validation/consumptionData";
import {mQStatusEnumSchema} from "./validation/mqResponse";
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

  public async getHistoryData(): Promise<ConsumptionData[]> {
    const request = new Request(`${this.baseUrl}api/electricity/consumption/history`, {method: 'GET'});
    const response = await handleFetch(request);
    return consumptionDataSchema.array().parse(await response.json());
  }

  public async getMQStatus(): Promise<MQStatusEnum> {
    const request = new Request(`${this.baseUrl}api/electricity/status`, {method: 'GET'});
    const response = await handleFetch(request);
    return mQStatusEnumSchema.parse(await response.json());
  }

  public getElectricityHubConnection(): Promise<HubConnection> {
    const hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.baseUrl}api/electricity/consumption`, {
        accessTokenFactory: async () => (await getAuthResponse()).accessToken,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();
    return Promise.resolve(hubConnection);
  }
}