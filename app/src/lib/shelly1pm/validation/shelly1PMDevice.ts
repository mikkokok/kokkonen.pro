import {z} from 'zod';
import {Shelly1PMDeviceName} from '../types/shelly1PMDeviceName';

const deviceNameKeys = ['OutdoorPowerOutlet', 'NumberLight'] as const satisfies readonly (keyof typeof Shelly1PMDeviceName)[];

export const shelly1PMDeviceSchema = z.object({
  name: z.enum(deviceNameKeys).transform((key) => Shelly1PMDeviceName[key]),
  ipAddress: z.string().nullable(),
  relayStatus: z.boolean().optional(),
});

export type Shelly1PMDevice = z.infer<typeof shelly1PMDeviceSchema>;
