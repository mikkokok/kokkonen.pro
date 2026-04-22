import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const lowPriceDateTimeRangeSchema = z.object({
  start: isoLocalOrOffsetDateTimeSchema,
  end: isoLocalOrOffsetDateTimeSchema,
  rank: z.number(),
  averagePrice: z.number(),
});

export const lowPricePeriodsSchema = z.object({
  lowPricePeriods: z.array(lowPriceDateTimeRangeSchema),
});

export type LowPricePeriods = z.infer<typeof lowPricePeriodsSchema>;

export const nightPeriodSchema = z.object({
  period: lowPriceDateTimeRangeSchema,
});

export type NightPeriod = z.infer<typeof nightPeriodSchema>;

export const heatingPeriodResponseSchema = nightPeriodSchema;
export type HeatingPeriodResponse = NightPeriod;

export const todayLowPricePeriodsResponseSchema = z.object({
  periods: z.array(lowPriceDateTimeRangeSchema).nullable().optional(),
});

export type TodayLowPricePeriodsResponse = z.infer<typeof todayLowPricePeriodsResponseSchema>;