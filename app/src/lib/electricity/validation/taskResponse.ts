import { z } from 'zod';

export const taskResponseSchema = z.string();

export type TaskResponse = z.infer<typeof taskResponseSchema>;
