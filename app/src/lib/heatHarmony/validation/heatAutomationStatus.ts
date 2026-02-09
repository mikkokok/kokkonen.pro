import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heatAutomationStatusResponseSchema = z.object({
  isWorkerRunning: z.boolean(),
  serverTime: isoLocalOrOffsetDateTimeSchema,
});

export type HeatAutomationStatusResponse = z.infer<typeof heatAutomationStatusResponseSchema>;
