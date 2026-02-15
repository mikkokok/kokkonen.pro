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

export function convertHarmonyChangeEnumToString(changeType: HarmonyChangeType): string {
  switch (changeType) {
    case HeatHarmonyChangeType.DisableWaterHeating:
      return 'Disabled water heating';
    case HeatHarmonyChangeType.EnableWaterHeating:
      return 'Enabled water heating';
    case HeatHarmonyChangeType.InsideTemp:
      return 'Inside temperature change';
    case HeatHarmonyChangeType.SetMinFlowTemp:
      return 'Set minimum flow temperature';
    case HeatHarmonyChangeType.SetInsideTemp:
      return 'Set inside temperature';
    case HeatHarmonyChangeType.SetMaximumFlow:
      return 'Set maximum flow temperature';
    case HeatHarmonyChangeType.SetAutoDriveOn:
      return 'Enabled shunt autodrive';
    case HeatHarmonyChangeType.SetDefault:
      return 'Reset to default settings';
    case HeatHarmonyChangeType.SetConservativeHeating:
      return 'Set conservative heating mode';
    case HeatHarmonyChangeType.OverrideEnable:
      return 'Enabled override mode';
    case HeatHarmonyChangeType.SetTargetTemp:
      return 'Set target temperature';
    case HeatHarmonyChangeType.SetQuietMode:
      return 'Enabled quiet mode';
    case HeatHarmonyChangeType.OilBurnerEnable:
      return 'Enabled oil burner';
    case HeatHarmonyChangeType.OilBurnerDisable:
      return 'Disabled oil burner';
    default:
      return 'Unknown change';
  }
}