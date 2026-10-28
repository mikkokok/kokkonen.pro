import {handleFetch} from '../fetchUtils';
import {ElectricityPrice, electricityPriceSchema} from '../heatHarmony/validation/pricesResponse';

export class RestlessFalconClient {
  private baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async getElectricityPrices(days = 0): Promise<ElectricityPrice[]> {
    const params = new URLSearchParams({days: String(days)});
    const request = new Request(`${this.baseUrl}api/restlessfalcon/prices?${params.toString()}`, {method: 'GET'});
    const response = await handleFetch(request);
    return electricityPriceSchema.array().parse(await response.json());
  }
}
