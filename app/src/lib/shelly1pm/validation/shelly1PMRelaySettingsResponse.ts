import {z} from 'zod';

export const shelly1PMRelaySettingsResponseSchema = z.object({
  name: z.string().nullable().optional(),
  appliance_type: z.string().nullable().optional(),
  ison: z.boolean().optional(),
  has_timer: z.boolean().optional(),
  default_state: z.string().nullable().optional(),
  btn_type: z.string().nullable().optional(),
  btn_reverse: z.number().int().optional(),
  auto_on: z.number().optional(),
  auto_off: z.number().optional(),
  schedule: z.boolean().optional(),
  schedule_rules: z.array(z.string()).nullable(),
  max_power: z.number().int().optional(),
});

export type Shelly1PMRelaySettingsResponse = z.infer<typeof shelly1PMRelaySettingsResponseSchema>;
