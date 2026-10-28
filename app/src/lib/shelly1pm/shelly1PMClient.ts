import {handleFetch} from '../fetchUtils';
import {Shelly1PMDeviceName} from './types/shelly1PMDeviceName';
import {Shelly1PMDevice, shelly1PMDeviceSchema} from './validation/shelly1PMDevice';
import {
  Shelly1PMRelaySettingsResponse,
  shelly1PMRelaySettingsResponseSchema,
} from './validation/shelly1PMRelaySettingsResponse';

export class Shelly1PMClient {
  private baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public async getDevices(): Promise<Shelly1PMDevice[]> {
    const request = new Request(`${this.baseUrl}api/shelly1pm/devices`, {method: 'GET'});
    const response = await handleFetch(request);
    return shelly1PMDeviceSchema.array().parse(await response.json());
  }

  public async setRelay(deviceName: Shelly1PMDeviceName, turnOn: boolean): Promise<void> {
    const params = new URLSearchParams({turnOn: String(turnOn)});
    const request = new Request(`${this.deviceUrl(deviceName)}/relay?${params.toString()}`, {method: 'POST'});
    await handleFetch(request);
  }

  public async getRelaySettings(deviceName: Shelly1PMDeviceName): Promise<Shelly1PMRelaySettingsResponse> {
    const request = new Request(`${this.deviceUrl(deviceName)}/settings`, {method: 'GET'});
    const response = await handleFetch(request);
    return shelly1PMRelaySettingsResponseSchema.parse(await response.json());
  }

  public async addRelaySchedule(
    deviceName: Shelly1PMDeviceName,
    schedule: string
  ): Promise<Shelly1PMRelaySettingsResponse> {
    return this.sendScheduleRequest(deviceName, schedule, 'POST');
  }

  public async removeRelaySchedule(
    deviceName: Shelly1PMDeviceName,
    schedule: string
  ): Promise<Shelly1PMRelaySettingsResponse> {
    return this.sendScheduleRequest(deviceName, schedule, 'DELETE');
  }

  private deviceUrl(deviceName: Shelly1PMDeviceName): string {
    return `${this.baseUrl}api/shelly1pm/${encodeURIComponent(String(deviceName))}`;
  }

  private async sendScheduleRequest(
    deviceName: Shelly1PMDeviceName,
    schedule: string,
    method: 'POST' | 'DELETE'
  ): Promise<Shelly1PMRelaySettingsResponse> {
    const params = new URLSearchParams({schedule});
    const request = new Request(`${this.deviceUrl(deviceName)}/schedule?${params.toString()}`, {method});
    const response = await handleFetch(request);
    return shelly1PMRelaySettingsResponseSchema.parse(await response.json());
  }
}
