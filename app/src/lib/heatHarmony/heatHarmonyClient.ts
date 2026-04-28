import {handleFetch} from "../fetchUtils";
import {HeatAutomationOverrideRequest} from "./types/heatAutomationOverrideRequest";
import {HeatAutomationOverrideResponse, heatAutomationOverrideResponseSchema} from "./validation/heatAutomationOverrideResponse";
import {HeatAutomationRemoveOverrideResponse, heatAutomationRemoveOverrideResponseSchema} from "./validation/heatAutomationRemoveOverrideResponse";
import {HeatAutomationStatusResponse, heatAutomationStatusResponseSchema} from "./validation/heatAutomationStatus";
import {HeatAutomationTaskResponse, heatAutomationTaskResponseSchema} from "./validation/heatAutomationTaskResponse";
import {
    HeatAutomationOverrideStatusResponse,
    heatAutomationOverrideStatusResponseSchema,
} from "./validation/heatAutomationOverrideStatusResponse";
import {HeishamonLatestResponse, heishamonLatestResponseSchema} from "./validation/heishamonLatestResponse";
import {HeishamonStatusResponse, heishamonStatusResponseSchema} from "./validation/heishamonStatusResponse";
import {HeishamonTaskResponse, heishamonTaskResponseSchema} from "./validation/heishamonTaskResponse";
import {
    HeatingPeriodResponse,
    heatingPeriodResponseSchema,
    NightPeriod,
    nightPeriodSchema,
    TodayLowPricePeriodsResponse,
    todayLowPricePeriodsResponseSchema,
} from "./validation/lowPricePeriods";
import {OumanLatestResponse, oumanLatestResponseSchema} from "./validation/oumanLatestResponse";
import {OumanStatusResponse, oumanStatusResponseSchema} from "./validation/oumanStatusResponse";
import {OumanTaskResponse, oumanTaskResponseSchema} from "./validation/oumanTaskResponse";
import {PingResponse, PingResponseSchema} from "./validation/pingStatus";
import {PricesResponse, pricesResponseSchema} from "./validation/pricesResponse";
import {TrvLatestResponse, trvLatestResponseSchema} from "./validation/trvLatestResponse";
import {TrvTaskResponse, trvTaskResponseSchema} from "./validation/trvTaskResponse";
import {OilburnerLatestResponse, oilburnerLatestResponseSchema} from "./validation/oilburnerLatestResponse";
import {EMOverrideStatusResponse, eMOverrideStatusResponseSchema} from "./validation/eMOverrideStatusResponse";
import {EMOverrideResponse, eMOverrideResponseSchema} from "./validation/eMOverrideResponse";
import {EMLatestResponse, eMLatestResponseSchema} from "./validation/eMLatestResponse";
import {UptimeResponse, uptimeResponseSchema} from "./validation/uptimeResponse";
import {EmChangesResponse, emChangesResponseSchema} from "./validation/emChangesResponse";
import {OilBurnerChangesResponse, oilBurnerChangesResponseSchema} from "./validation/oilBurnerChangesResponse";
import {Pro3StatusResponse, pro3StatusResponseSchema} from "./validation/pro3StatusResponse";
import {Pro3OverrideAcceptedResponse, pro3OverrideAcceptedResponseSchema} from "./validation/pro3OverrideAcceptedResponse";
import {Pro3OverrideCancelledResponse, pro3OverrideCancelledResponseSchema} from "./validation/pro3OverrideCancelledResponse";
import {Pro3OverrideStatusResponse, pro3OverrideStatusResponseSchema} from "./validation/pro3OverrideStatusResponse";

export class HeatHarmonyClient {
    private baseUrl: string;

    public constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    public async getPingStatus(): Promise<PingResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/appstatus/ping`, {method: 'GET'});
        const response = await handleFetch(request);
        return PingResponseSchema.parse(await response.json());
    }

    public async getUptime(): Promise<UptimeResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/appstatus/uptime`, {method: 'GET'});
        const response = await handleFetch(request);
        return uptimeResponseSchema.parse(await response.json());
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

    public async getOverrideStatus(): Promise<HeatAutomationOverrideStatusResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/override`, {method: 'GET'});
        const response = await handleFetch(request);
        return heatAutomationOverrideStatusResponseSchema.parse(await response.json());
    }

    public async setOverride(requestBody: HeatAutomationOverrideRequest): Promise<HeatAutomationOverrideResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/override`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
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

    public async getLatestHeishamonData(): Promise<HeishamonLatestResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heishamon/latest`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return heishamonLatestResponseSchema.parse(await response.json());
    }

    public async getLatestHeishamonHistoryData(): Promise<HeishamonLatestResponse[]> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heishamon/latestHistory`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return heishamonLatestResponseSchema.array().parse(await response.json());
    }

    public async getHeishamonTaskStatus(): Promise<HeishamonTaskResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heishamon/task`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return heishamonTaskResponseSchema.parse(await response.json());
    }

    public async getHeishamonStatus(): Promise<HeishamonStatusResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heishamon/status`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return heishamonStatusResponseSchema.parse(await response.json());
    }

    public async getOumanTaskStatus(): Promise<OumanTaskResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/ouman/task`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return oumanTaskResponseSchema.parse(await response.json());
    }

    public async getOumanStatus(): Promise<OumanStatusResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/ouman/status`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return oumanStatusResponseSchema.parse(await response.json());
    }

    public async getOumanLatestData(): Promise<OumanLatestResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/ouman/latest`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return oumanLatestResponseSchema.parse(await response.json());
    }

    public async getOumanLatestHistory(): Promise<OumanLatestResponse[]> {
        const request = new Request(`${this.baseUrl}api/heatharmony/ouman/latestHistory`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return oumanLatestResponseSchema.array().parse(await response.json());
    }

    public async getHeatingPeriodSource(): Promise<string> {
        const request = new Request(`${this.baseUrl}api/heatharmony/heatautomation/heatperiod`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        const raw = await response.json();
        return typeof raw === 'string' ? raw : String(raw ?? '');
    }

    public async getTodayElectricityPrices(): Promise<PricesResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/prices/today`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return pricesResponseSchema.parse(await response.json());
    }

    public async getTomorrowElectricityPrices(): Promise<PricesResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/prices/tomorrow`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return pricesResponseSchema.parse(await response.json());
    }

    public async getTodaysLowPricePeriods(): Promise<TodayLowPricePeriodsResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/prices/lowperiods/today`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return todayLowPricePeriodsResponseSchema.parse(await response.json());
    }

    public async getAllLowPricePeriods(): Promise<TodayLowPricePeriodsResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/prices/lowperiods/all`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return todayLowPricePeriodsResponseSchema.parse(await response.json());
    }

    public async getNightPeriodElectricityPrices(): Promise<NightPeriod> {
        const request = new Request(`${this.baseUrl}api/heatharmony/prices/nightperiod`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return nightPeriodSchema.parse(await response.json());
    }

    public async getDayPeriodElectricityPrices(): Promise<HeatingPeriodResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/prices/dayperiod`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return heatingPeriodResponseSchema.parse(await response.json());
    }

    public async getTrvLatestData(): Promise<TrvLatestResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/trv/latest`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return trvLatestResponseSchema.parse(await response.json());
    }

    public async getTrvTaskStatus(): Promise<TrvTaskResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/trv/task`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return trvTaskResponseSchema.parse(await response.json());
    }

    public async enableOilburner() {
        const request = new Request(`${this.baseUrl}api/heatharmony/oilburner/enable`, {
            method: 'POST',
        });
        await handleFetch(request);
    }

    public async disableOilburner() {
        const request = new Request(`${this.baseUrl}api/heatharmony/oilburner/disable`, {
            method: 'POST',
        });
        await handleFetch(request);
    }

    public async getOilburnerLatestData(): Promise<OilburnerLatestResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/oilburner/latest`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return oilburnerLatestResponseSchema.parse(await response.json());
    }

    public async getOilBurnerChanges(): Promise<OilBurnerChangesResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/oilburner/changes`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return oilBurnerChangesResponseSchema.parse(await response.json());
    }

    public async getUseWaterHeaterLatest(): Promise<EMLatestResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/latest`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return eMLatestResponseSchema.parse(await response.json());
    }

    public async enableUseWaterHeater() {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/enable`, {
            method: 'POST',
        });
        await handleFetch(request);
    }

    public async disableUseWaterHeater() {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/disable`, {
            method: 'POST',
        });
        await handleFetch(request);
    }

    public async deleteUseWaterHeaterOverride() {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/override/delete`, {
            method: 'DELETE',
        });
        await handleFetch(request);
    }

    public async setEnableUseWaterHeaterOverride(hours: number): Promise<EMOverrideResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/override/enable/${hours}`, {
            method: 'POST',
        });
        const response = await handleFetch(request);
        return eMOverrideResponseSchema.parse(await response.json());
    }

    public async setDisableUseWaterHeaterOverride(hours: number): Promise<EMOverrideResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/override/disable/${hours}`, {
            method: 'POST',
        });
        const response = await handleFetch(request);
        return eMOverrideResponseSchema.parse(await response.json());
    }

    public async getUseWaterHeaterOverrideStatus(): Promise<EMOverrideStatusResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/override/status`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return eMOverrideStatusResponseSchema.parse(await response.json());
    }

    public async getEMChanges(): Promise<EmChangesResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/em/changes`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return emChangesResponseSchema.parse(await response.json());
    }

    public async getPro3Status(): Promise<Pro3StatusResponse[]> {
        const request = new Request(`${this.baseUrl}api/heatharmony/pro3/status`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return pro3StatusResponseSchema.array().parse(await response.json());
    }

    public async getPro3OverrideStatus(): Promise<Pro3OverrideStatusResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/pro3/override/status`, {
            method: 'GET',
        });
        const response = await handleFetch(request);
        return pro3OverrideStatusResponseSchema.parse(await response.json());
    }

    public async overridePro3Output(
        outputAmount: number,
        output: boolean,
        durationMinutes: number
    ): Promise<Pro3OverrideAcceptedResponse> {
        const params = new URLSearchParams({
            outputAmount: String(outputAmount),
            output: String(output),
            durationMinutes: String(durationMinutes),
        });
        const request = new Request(`${this.baseUrl}api/heatharmony/pro3/override?${params.toString()}`, {
            method: 'POST',
        });
        const response = await handleFetch(request);
        return pro3OverrideAcceptedResponseSchema.parse(await response.json());
    }

    public async cancelPro3Override(): Promise<Pro3OverrideCancelledResponse> {
        const request = new Request(`${this.baseUrl}api/heatharmony/pro3/override/cancel`, {
            method: 'POST',
        });
        const response = await handleFetch(request);
        return pro3OverrideCancelledResponseSchema.parse(await response.json());
    }
}