import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const uptimeInfoSchema = z.object({
  ticks: z.number().optional(),
  totalSeconds: z.number().optional(),
  duration: z.string().nullable(),
});

export type UptimeInfo = z.infer<typeof uptimeInfoSchema>;

export const uptimeResponseSchema = z.object({
  startupTime: isoLocalOrOffsetDateTimeSchema.optional(),
  serverTime: isoLocalOrOffsetDateTimeSchema.optional(),
  uptime: uptimeInfoSchema,
});

export type UptimeResponse = z.infer<typeof uptimeResponseSchema>;
