import {z} from 'zod';
import {isoLocalOrOffsetDateTimeSchema} from './dateTime';
import {TRVStatusEnum} from '../types/trvStatus';

export const trvStatusEnumSchema = z.nativeEnum(TRVStatusEnum);

export function convertTRVStatusEnumToString(status: TRVStatusEnum): string {
  switch (status) {
    case TRVStatusEnum.Ok:
      return 'Ok';
    case TRVStatusEnum.Error:
      return 'Error';
    case TRVStatusEnum.Unknown:
      return 'Unknown';
    default:
      throw new Error('Invalid TRVStatusEnum value');
  }
}

export const trvSchema = z.object({
  name: z.string().nullable(),
  ip: z.string().nullable(),
  updatedAt: isoLocalOrOffsetDateTimeSchema,
  status: trvStatusEnumSchema,
  message: z.string().nullable(),
  batteryLevel: z.number().int(),
  latestLevel: z.number(),
  autoTemperature: z.boolean(),
});

export type Trv = z.infer<typeof trvSchema>;


export const trvLatestResponseSchema = z.object({
  serverTime: isoLocalOrOffsetDateTimeSchema,
  devices: z.array(trvSchema).nullable(),
});

export type TrvLatestResponse = z.infer<typeof trvLatestResponseSchema>;