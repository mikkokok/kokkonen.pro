import { handleFetchErrors, patchAuthHeaders } from "../fetchUtils";
import { PingResponse, PingResponseSchema } from "./validation/pingStatus";


export class HeatHarmonyClient {
    private baseUrl: string;

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async getPingStatus(): Promise<PingResponse> {
        const request = new Request(`${this.baseUrl}appstatus/ping`, {method: 'GET'});
        const response = await this.handleFetch(request);
        return PingResponseSchema.parse(await response.json());
    }

    private async handleFetch(request: Request): Promise<Response> {
        await patchAuthHeaders(request);
        const response = await fetch(request);
        handleFetchErrors(response);
        return response;
    }
}