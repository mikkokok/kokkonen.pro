import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const oumanLatestResponseSchema = z.object({
  outsideTemp: z.number(),
  flowDemand: z.number(),
  insideTempDemand: z.number(),
  minFlowTemp: z.number(),
  autoTemp: z.boolean(),
  insideTemp: z.number(),
  serverTime: isoLocalOrOffsetDateTimeSchema,
});

export type OumanLatestResponse = z.infer<typeof oumanLatestResponseSchema>;