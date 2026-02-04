import {handleFetch} from "../fetchUtils";
import {HeatAutomationOverrideRequest} from "./types/heatAutomationOverrideRequest";
import {HeatAutomationOverrideResponse, heatAutomationOverrideResponseSchema} from "./validation/heatAutomationOverrideResponse";
import {HeatAutomationRemoveOverrideResponse, heatAutomationRemoveOverrideResponseSchema} from "./validation/heatAutomationRemoveOverrideResponse";
import {HeatAutomationStatusResponse, heatAutomationStatusResponseSchema} from "./validation/heatAutomationStatus";
import {HeatAutomationTaskResponse, heatAutomationTaskResponseSchema} from "./validation/heatAutomationTaskResponse";
import {PingResponse, PingResponseSchema} from "./validation/pingStatus";


export class HeatHarmonyClient {
    private baseUrl: string;

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async getPingStatus(): Promise<PingResponse> {
        const request = new Request(`${this.baseUrl}api/appstatus/ping`, {method: 'GET'});
        const response = await handleFetch(request);
        return PingResponseSchema.parse(await response.json());
    }

    public async getHeatAutomationStatus(): Promise<HeatAutomationStatusResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/status`, {method: 'GET'});
        const response = await handleFetch(request);
        return heatAutomationStatusResponseSchema.parse(await response.json());
    }

    public async getHeatAutomationTaskStatus(): Promise<HeatAutomationTaskResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/tasks`, {method: 'GET'});
        const response = await handleFetch(request);
        return heatAutomationTaskResponseSchema.parse(await response.json());
    }

    public async getOverrideStatus(): Promise<HeatAutomationOverrideResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/override`, {method: 'GET'});
        const response = await handleFetch(request);
        return heatAutomationOverrideResponseSchema.parse(await response.json());
    }

    public async setOverride(requestBody: HeatAutomationOverrideRequest): Promise<HeatAutomationOverrideResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/override`, {
            method: 'POST',
            body: JSON.stringify(requestBody),
        });
        const response = await handleFetch(request);
        return heatAutomationOverrideResponseSchema.parse(await response.json());
    }

    public async removeOverride(): Promise<HeatAutomationRemoveOverrideResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/override`, {
            method: 'DELETE',
        });
        const response = await handleFetch(request);
        return heatAutomationRemoveOverrideResponseSchema.parse(await response.json());
    }
}