import {z} from 'zod';

export const pro3SetResponseSchema = z.object({
  was_on: z.boolean(),
});

export type Pro3SetResponse = z.infer<typeof pro3SetResponseSchema>;

export const pro3StatusResponseSchema = z.object({
  id: z.number().int(),
  source: z.string().nullable(),
  output: z.boolean(),
  temperature: z.object({
    tC: z.number(),
    tF: z.number(),
  }),
});

export type Pro3StatusResponse = z.infer<typeof pro3StatusResponseSchema>;
