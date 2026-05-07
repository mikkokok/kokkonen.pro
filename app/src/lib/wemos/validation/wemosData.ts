import {z} from 'zod';

export const wemosKeysSchema = z.enum([
  'FreeHeap',
  'HeapFragmentation',
  'MaxFreeBlock',
  'Uptime',
  'WifiSignalStrength',
]);

export type WemosKeys = z.infer<typeof wemosKeysSchema>;

export const validWemosKeys = wemosKeysSchema.options;

export const wemosDataSchema = z.object({
  timestamp: z.string(),
  data: z
    .record(wemosKeysSchema, z.number())
    .nullable()
    .transform((value) => value ?? {}),
});

export type WemosData = z.output<typeof wemosDataSchema>;

export function translateKey(key: WemosKeys) {
  switch (key) {
    case 'FreeHeap':
      return 'Free heap';
    case 'HeapFragmentation':
      return 'Heap fragmentation';
    case 'MaxFreeBlock':
      return 'Max free block';
    case 'Uptime':
      return 'Uptime';
    case 'WifiSignalStrength':
      return 'WiFi signal strength';
  }
}

export function translateUnit(key: WemosKeys) {
  switch (key) {
    case 'FreeHeap':
    case 'MaxFreeBlock':
      return 'B';
    case 'HeapFragmentation':
      return '%';
    case 'Uptime':
      return 's';
    case 'WifiSignalStrength':
      return 'dBm';
  }
}
