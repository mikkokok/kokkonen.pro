import {createSelector} from '@reduxjs/toolkit';
import {buildDownsampledTimeSeriesChartData} from '../lib/charts/timeSeriesChart';
import {scaleConsumptionValue} from '../lib/electricity/consumptionDisplay';
import {buildDailyEnergySummary, prepareConsumptionHistory} from '../lib/electricity/dailyTotals';
import {translateKey, validConsumptionKeys} from '../lib/electricity/validation/consumptionData';
import type {RootState} from './store';

export const selectHistoryData = (state: RootState) => state.electricity.historyData;
const selectSpotPrices = (state: RootState) => state.electricity.spotPriceByInterval;

export const selectPreparedHistory = createSelector([selectHistoryData], prepareConsumptionHistory);

export const selectDailySummary = createSelector(
  [selectPreparedHistory, selectSpotPrices],
  buildDailyEnergySummary
);

export const selectActualChartData = createSelector([selectPreparedHistory], (history) =>
  buildDownsampledTimeSeriesChartData(history, ['ActualConsumption', 'ActualReturndelivery'], {
    keyToLabel: translateKey,
    scaleValue: scaleConsumptionValue,
  })
);

export const selectDetailsChartData = createSelector([selectPreparedHistory], (history) =>
  buildDownsampledTimeSeriesChartData(history, validConsumptionKeys, {
    keyToLabel: translateKey,
    scaleValue: scaleConsumptionValue,
  })
);