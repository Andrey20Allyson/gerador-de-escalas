import { z } from "zod";

export const AUTO_SCHEDULE_CONFIG_SCHEMA = z.object({
  firebase: z.object({
    key: z
      .string()
      .default('keys/firebase-key.aes'),
  }).default({}),

  rules: z.object({
    use: z.string(),
  }).array().default([
    { use: 'builtin.all' },
  ]),

  repositories: z.object({
    tag: z.string(),
    config: z.object({}),
  }).array().default([])
});

export function parseConfig(config: unknown) {
  return AUTO_SCHEDULE_CONFIG_SCHEMA.parse(config)
}

export type AutoScheduleConfig = z.infer<typeof AUTO_SCHEDULE_CONFIG_SCHEMA>;