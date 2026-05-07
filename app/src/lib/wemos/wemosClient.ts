import {handleFetch} from "../fetchUtils";
import {WemosData, wemosDataSchema} from "./validation/wemosData";

export class WemosClient {
  private baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async getHistoryData(): Promise<WemosData[]> {
    const request = new Request(`${this.baseUrl}api/wemos/history`, {method: 'GET'});
    const response = await handleFetch(request);
    return wemosDataSchema.array().parse(await response.json());
  }
}
