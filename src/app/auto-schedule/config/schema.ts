import { z } from "zod";

export const AUTO_SCHEDULE_CONFIG_SCHEMA = z.object({
  firebase: z.object({
    key: z
      .string()
      .default('keys/firebase-key.aes'),
  }).default({}),

  registries: z.object({
    cacheDir: z
      .string()
      .default('.cache/auto-schedule/'),
  }).default({}),
});