import {z} from 'zod';
import {EMOverrideMode} from '../types/emOverrrideMode';

export const eMOverrideModeSchema = z.nativeEnum(EMOverrideMode);

export const eMOverrideResponseSchema = z.object({
  mode: eMOverrideModeSchema,
  hours: z.number(),
});

export type EMOverrideResponse = z.infer<typeof eMOverrideResponseSchema>;