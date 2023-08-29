import zod, { ZodType } from 'zod';

export function createCacheSchema<T>(dataSchema: ZodType<T>) {
  return zod.object({
    collectionName: zod.string(),
    version: zod.number(),
    lastUpdate: zod.number(),
    data: dataSchema.array(),
  });
}

export type CacheSchemaType<T> = ReturnType<typeof createCacheSchema<T>>;
export interface CacheType<T> extends zod.infer<ReturnType<typeof createCacheSchema<T>>> { }