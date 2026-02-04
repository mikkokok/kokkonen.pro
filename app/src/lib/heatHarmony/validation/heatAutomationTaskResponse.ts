import {z} from 'zod';

export const heatAutomationTaskStatusSchema = z.object({
  status: z.string(),
  errros: z.array(z.string()),
});

export const heatAutomationTaskResponseSchema = z.object({
  serverTime: z.string().datetime(),
  oumanAndHeishamonSync: heatAutomationTaskStatusSchema,
  setUseWaterBasedOnPrice: heatAutomationTaskStatusSchema,
  setInsideTempBasedOnPrice: heatAutomationTaskStatusSchema,
});

export type HeatAutomationTaskResponse = z.infer<typeof heatAutomationTaskResponseSchema>;