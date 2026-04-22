import {z} from 'zod';
import {eMOverrideModeSchema} from './eMOverrideResponse';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';

export const eMOverrideStatusResponseSchema = z.object({
  overrideMode: eMOverrideModeSchema,
  isOverrideActive: z.boolean(),
  overrideUntil: isoLocalOrOffsetDateTimeSchema.nullable()
});

export type EMOverrideStatusResponse = z.infer<typeof eMOverrideStatusResponseSchema>;