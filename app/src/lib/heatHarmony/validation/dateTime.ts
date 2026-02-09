import {z} from 'zod';

export const isoLocalOrOffsetDateTimeSchema = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/,
    'Invalid datetime'
  );

export type IsoLocalOrOffsetDateTime = z.infer<typeof isoLocalOrOffsetDateTimeSchema>;
