import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';
import {HeatHarmonyProvider} from '../types/heatHarmonyProvider';
import {HeatHarmonyChangeType} from '../types/heatHarmonyChange';

export const heatHarmonyProviderSchema = z.nativeEnum(HeatHarmonyProvider);

export const harmonyChangeTypeSchema = z.nativeEnum(HeatHarmonyChangeType);

export type HarmonyChangeType = z.infer<typeof harmonyChangeTypeSchema>;

export const harmonyChangeSchema = z.object({
  time: isoLocalOrOffsetDateTimeSchema,
  provider: heatHarmonyProviderSchema,
  changeType: harmonyChangeTypeSchema,
  description: z.string().nullable(),
});

export type HarmonyChange = z.infer<typeof harmonyChangeSchema>;