import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const heatAutomationTaskStatusSchema = z.object({
  status: z.string().nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
});

export const heatAutomationTaskResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  oumanAndHeishamonSync: heatAutomationTaskStatusSchema,
  setUseWaterBasedOnPrice: heatAutomationTaskStatusSchema,
  setInsideTempBasedOnPrice: heatAutomationTaskStatusSchema,
});

export type HeatAutomationTaskResponse = z.infer<typeof heatAutomationTaskResponseSchema>;