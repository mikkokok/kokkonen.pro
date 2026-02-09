import {z} from 'zod';

export const electricityPriceSchema = z.object({
  price: z.string(),
  date: z.string(),
  hour: z.number(),
});

export type ElectricityPrice = z.infer<typeof electricityPriceSchema>;

export const pricesResponseSchema = z.object({
  prices: z.array(electricityPriceSchema).nullable(),
});

export type PricesResponse = z.infer<typeof pricesResponseSchema>;