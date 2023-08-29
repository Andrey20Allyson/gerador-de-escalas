import fs from 'fs/promises';
import _path from 'path';
import zod, { ZodType } from 'zod';
import { fromRoot } from '../path.utils';
import { Config } from '../utils/config';

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

export const cacheDir = fromRoot('.cache');

export function getCachePath(name: string) {
  return _path.join(cacheDir, `${name}.json`);
}

export type DiskCacheFileSystem = Pick<typeof fs,
  | 'readFile'
  | 'writeFile'
  | 'access'
  | 'mkdir'
>;

export type DiskCacheConfig<T = unknown> = Config<{
  readonly fs: DiskCacheFileSystem;
  readonly dataSchema: ZodType<T>;
  readonly directory: string;
  readonly name: string;
}, 'name'>;

export interface DiskCacheConfigParam<T = unknown> extends Config.Partial<DiskCacheConfig<T>> { };

export class DiskCache<T = unknown> {
  static readonly defaults: Config.Defaults<DiskCacheConfig> = {
    directory: _path.resolve(process.cwd(), '.cache'),
    dataSchema: zod.unknown(),
    fs,
  };

  config: Config.From<DiskCacheConfig<T>>;
  cacheSchema: CacheSchemaType<T>;

  constructor(config: DiskCacheConfigParam<T>) {
    this.config = Config.create<DiskCacheConfig<T>, DiskCacheConfig>(config, DiskCache.defaults);

    this.cacheSchema = createCacheSchema(this.config.dataSchema);
  }

  resolvePath() {
    return _path.resolve(this.config.directory, this.config.name + '.json');
  }

  async createCacheDirectoryIfDontExist() {
    try {
      await fs.access(this.config.directory);
    } catch {
      fs.mkdir(this.config.directory);
    }
  }

  async write(buffer: string): Promise<void> {
    const path = this.resolvePath();

    return fs.writeFile(path, buffer);
  }

  async read(): Promise<string | null> {
    const path = this.resolvePath();

    try {
      return fs.readFile(path, 'utf-8');
    } catch {
      return null;
    }
  }

  parseWithSchema(buffer: string): CacheType<T> {
    const json = JSON.parse(buffer);
    return this.cacheSchema.parse(json);
  }

  async save(data: CacheType<T>): Promise<void> {
    this.createCacheDirectoryIfDontExist();

    const buffer = JSON.stringify(data);

    await this.write(buffer);
  }

  async saveHeader() {

  }

  async load(): Promise<CacheType<T> | null> {
    const buffer = await this.read();
    if (buffer === null) return buffer;

    return this.parseWithSchema(buffer);
  }

  async loadHeader() {

  }
}