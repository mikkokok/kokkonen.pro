import {createAsyncThunk, createSlice, type PayloadAction} from '@reduxjs/toolkit';
import {backendUrl} from '../config/config';
import {ElectricityClient} from '../lib/electricity/electricityClient';
import {RestlessFalconClient} from '../lib/restlessFalcon/restlessFalconClient';
import {hourKeyFromDate, quarterKeyFromDate} from '../lib/electricity/pricing';
import {devLog} from '../lib/logger';
import {convertMQStatusEnumToString} from '../lib/electricity/validation/mqResponse';
import type {ConsumptionData} from '../lib/electricity/validation/consumptionData';
import type {ElectricityPrice} from '../lib/heatHarmony/validation/pricesResponse';
import type {RootState} from './store';

const electricityClient = new ElectricityClient(backendUrl);
const restlessFalconClient = new RestlessFalconClient(backendUrl);

const HISTORY_CACHE_TTL_MS = 4 * 60 * 1000;
const MQ_STATUS_CACHE_TTL_MS = 30 * 1000;
const SPOT_PRICE_CACHE_TTL_MS = 10 * 60 * 1000;
const DEFAULT_SPOT_PRICE_DAYS = 14;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function spotPriceDaysForHistory(historyData: ConsumptionData[] | null): number {
  if (!historyData || historyData.length === 0) {
    return DEFAULT_SPOT_PRICE_DAYS;
  }

  const oldestTs = Math.min(
    ...historyData.map((point) => new Date(point.timestamp).getTime()).filter((ts) => !Number.isNaN(ts))
  );
  if (!Number.isFinite(oldestTs)) {
    return DEFAULT_SPOT_PRICE_DAYS;
  }

  return Math.max(1, Math.ceil((Date.now() - oldestTs) / MS_PER_DAY));
}

function parseSpotPriceValue(raw: string | null): number | null {
  if (raw === null) {
    return null;
  }

  const normalized = raw.replace(',', '.');
  const value = Number.parseFloat(normalized);
  if (!Number.isFinite(value)) {
    return null;
  }

  return value;
}

// Parses "YYYY-MM-DD[ HH:mm[:ss]]" as local time; falls back to the row's hour when no time is given.
function parseSpotPriceStart(date: string, hour: number): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/.exec(date);
  if (!match) {
    return null;
  }

  const [, year, month, day, hh, mm] = match;
  return new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    hh === undefined ? hour : Number(hh),
    mm === undefined ? 0 : Number(mm)
  );
}

function buildSpotPriceMap(prices: ElectricityPrice[]): Record<string, number> {
  const map: Record<string, number> = {};

  for (const row of prices) {
    if (row.date === null) {
      continue;
    }

    const start = parseSpotPriceStart(row.date, row.hour);
    if (start === null || Number.isNaN(start.getTime())) {
      continue;
    }

    const price = parseSpotPriceValue(row.price);
    if (price === null) {
      continue;
    }

    map[quarterKeyFromDate(start)] = price;
    if (start.getMinutes() === 0) {
      map[hourKeyFromDate(start)] = price;
    }
  }

  if (prices.length > 0 && Object.keys(map).length === 0) {
    devLog('No usable spot price rows, sample row:', prices[0]);
  }

  return map;
}

export interface ElectricityState {
  connectionStatus: string;
  latestConsumptionData: ConsumptionData | null;
  historyData: ConsumptionData[] | null;
  historyLoading: boolean;
  historyError: string | null;
  historyLastFetchedAt: number | null;
  mqStatus: string | null;
  mqStatusUpdatedAt: string | null;
  mqStatusLoading: boolean;
  mqStatusError: string | null;
  mqStatusLastFetchedAt: number | null;
  spotPriceByInterval: Record<string, number>;
  spotPriceLoading: boolean;
  spotPriceError: string | null;
  spotPriceLastFetchedAt: number | null;
}

const initialState: ElectricityState = {
  connectionStatus: 'Disconnected',
  latestConsumptionData: null,
  historyData: null,
  historyLoading: false,
  historyError: null,
  historyLastFetchedAt: null,
  mqStatus: null,
  mqStatusUpdatedAt: null,
  mqStatusLoading: false,
  mqStatusError: null,
  mqStatusLastFetchedAt: null,
  spotPriceByInterval: {},
  spotPriceLoading: false,
  spotPriceError: null,
  spotPriceLastFetchedAt: null,
};

export const fetchHistoryData = createAsyncThunk<ConsumptionData[], boolean | undefined, {state: RootState}>(
  'electricity/fetchHistoryData',
  async () => electricityClient.getHistoryData(),
  {
    condition: (force = false, {getState}) => {
      if (force) {
        return true;
      }

      const state = getState().electricity;
      if (state.historyLoading) {
        return false;
      }

      if (state.historyLastFetchedAt === null) {
        return true;
      }

      return Date.now() - state.historyLastFetchedAt > HISTORY_CACHE_TTL_MS;
    },
  }
);

export const fetchMqStatus = createAsyncThunk<
  {status: string; updatedAt: string},
  boolean | undefined,
  {state: RootState}
>(
  'electricity/fetchMqStatus',
  async () => {
    const status = await electricityClient.getMQStatus();
    return {
      status: convertMQStatusEnumToString(status),
      updatedAt: new Date().toISOString(),
    };
  },
  {
    condition: (force = false, {getState}) => {
      if (force) {
        return true;
      }

      const state = getState().electricity;
      if (state.mqStatusLoading) {
        return false;
      }

      if (state.mqStatusLastFetchedAt === null) {
        return true;
      }

      return Date.now() - state.mqStatusLastFetchedAt > MQ_STATUS_CACHE_TTL_MS;
    },
  }
);

export const fetchSpotPrices = createAsyncThunk<Record<string, number>, boolean | undefined, {state: RootState}>(
  'electricity/fetchSpotPrices',
  async (_force, {getState}) => {
    const days = spotPriceDaysForHistory(getState().electricity.historyData);
    const prices = await restlessFalconClient.getElectricityPrices(days);
    return buildSpotPriceMap(prices);
  },
  {
    condition: (force = false, {getState}) => {
      if (force) {
        return true;
      }

      const state = getState().electricity;
      if (state.spotPriceLoading) {
        return false;
      }

      if (state.spotPriceLastFetchedAt === null) {
        return true;
      }

      return Date.now() - state.spotPriceLastFetchedAt > SPOT_PRICE_CACHE_TTL_MS;
    },
  }
);

const electricitySlice = createSlice({
  name: 'electricity',
  initialState,
  reducers: {
    setConnectionStatus(state, action: PayloadAction<string>) {
      state.connectionStatus = action.payload;
    },
    setLatestConsumptionData(state, action: PayloadAction<ConsumptionData | null>) {
      state.latestConsumptionData = action.payload;
    },
    setMqStatusError(state, action: PayloadAction<string | null>) {
      state.mqStatusError = action.payload;
      state.mqStatusUpdatedAt = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHistoryData.pending, (state) => {
        state.historyLoading = true;
        state.historyError = null;
      })
      .addCase(fetchHistoryData.fulfilled, (state, action) => {
        state.historyLoading = false;
        state.historyData = action.payload;
        state.historyLastFetchedAt = Date.now();
      })
      .addCase(fetchHistoryData.rejected, (state, action) => {
        state.historyLoading = false;
        state.historyError = action.error.message ?? 'Failed to fetch history data';
      })
      .addCase(fetchMqStatus.pending, (state) => {
        state.mqStatusLoading = true;
        state.mqStatusError = null;
      })
      .addCase(fetchMqStatus.fulfilled, (state, action) => {
        state.mqStatusLoading = false;
        state.mqStatus = action.payload.status;
        state.mqStatusUpdatedAt = action.payload.updatedAt;
        state.mqStatusLastFetchedAt = Date.now();
      })
      .addCase(fetchMqStatus.rejected, (state, action) => {
        state.mqStatusLoading = false;
        state.mqStatus = null;
        state.mqStatusError = action.error.message ?? 'Failed to fetch MQ status';
        state.mqStatusUpdatedAt = new Date().toISOString();
      })
      .addCase(fetchSpotPrices.pending, (state) => {
        state.spotPriceLoading = true;
        state.spotPriceError = null;
      })
      .addCase(fetchSpotPrices.fulfilled, (state, action) => {
        state.spotPriceLoading = false;
        state.spotPriceByInterval = action.payload;
        state.spotPriceLastFetchedAt = Date.now();
      })
      .addCase(fetchSpotPrices.rejected, (state, action) => {
        state.spotPriceLoading = false;
        state.spotPriceError = action.error.message ?? 'Failed to fetch spot prices';
      });
  },
});

export const {setConnectionStatus, setLatestConsumptionData, setMqStatusError} = electricitySlice.actions;
export {electricityClient};

export default electricitySlice.reducer;
