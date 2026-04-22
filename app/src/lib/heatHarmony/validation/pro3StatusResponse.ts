import {z} from 'zod';

export const pro3SetResponseSchema = z.object({
  was_on: z.boolean(),
});

export type Pro3SetResponse = z.infer<typeof pro3SetResponseSchema>;

export const pro3StatusResponseSchema = z.array(pro3SetResponseSchema);

export type Pro3StatusResponse = z.infer<typeof pro3StatusResponseSchema>;
