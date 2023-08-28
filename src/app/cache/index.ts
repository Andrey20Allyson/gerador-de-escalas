import zod, { ZodType } from 'zod';
import { fromRoot } from '../path.utils';
import fs from 'fs/promises';
import _path from 'path';

export function createCacheSchema<T>(dataSchema: ZodType<T>) {
  return zod.object({
    collectionName: zod.string(),
    version: zod.number(),
    lastUpdate: zod.number(),
    data: dataSchema.array(),
  });
}

export interface CacheType<T> extends zod.infer<ReturnType<typeof createCacheSchema<T>>> { };

export const cacheDir = fromRoot('.cache');

export function getCachePath(name: string) {
  return _path.join(cacheDir, `${name}.json`);
}

export async function loadCache<T>(name: string, schema: ZodType<T>): Promise<CacheType<T> | null> {
  const path = getCachePath(name);
  let buffer: string | undefined;

  try {
    buffer = await fs.readFile(path, { encoding: 'utf-8' });
  } catch (error) {
    return null;
  }

  const json = JSON.parse(buffer);
  const cache = createCacheSchema(schema).parse(json);

  return cache;
}

export async function saveCache(name: string, cache: CacheType<unknown>) {
  const path = getCachePath(name);

  try {
    await fs.access(cacheDir);
  } catch {
    fs.mkdir(cacheDir);
  }

  await fs.writeFile(path, JSON.stringify(cache));
}