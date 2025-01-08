import { z } from "zod";
import { autoScheduleConfig } from "../../../../config";

const CONFIG_SCHEMA = z
  .object({
    cacheDir: z.string().default(".cache/auto-schedule/"),

    collectionName: z.string().default("worker-registries"),
  })
  .default({});

const CONFIG_TAG = "repository.worker-registry.firestore";

const unparsedConfig = autoScheduleConfig.repositories.find(
  (entry) => entry.tag === CONFIG_TAG,
);

export const firestoreWorkerRegistryRepositoryConfig =
  CONFIG_SCHEMA.parse(unparsedConfig);
