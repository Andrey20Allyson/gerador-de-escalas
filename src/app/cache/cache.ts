import fs from 'fs';
import { Config } from '../utils/config';
import { CacheType } from './types';
import { CacheIO } from './io';
import { RegistryEntryType, CollectionHeaderType } from '../base';

export type DiskCacheConfig<T = unknown> = Config<{
  entries: CacheIO<RegistryEntryType<T>[]>;
  header: CacheIO<CollectionHeaderType>;
  useInMemoryCache: boolean;
},
  | 'entries'
  | 'header'
>;

export interface DiskCacheConfigParam<T = unknown> extends Config.Partial<DiskCacheConfig<T>> { };
export interface WatchForUpdatesOptions extends fs.WatchOptions { }

export class DiskCache<T = unknown> {
  config: Config.From<DiskCacheConfig<T>>;
  inMemoryCache: CacheType<T> | null;

  constructor(config: DiskCacheConfigParam<T>) {
    const defaults: Config.Defaults<DiskCacheConfig<T>> = { useInMemoryCache: true };

    this.config = Config.create<DiskCacheConfig<T>, DiskCacheConfig<T>>(config, defaults);

    this.inMemoryCache = null;
  }

  get entries() {
    return this.config.entries;
  }

  get header() {
    return this.config.header;
  }

  async save(data: CacheType<T>): Promise<void> {
    this.inMemoryCache = data;

    this.header.write(data.header);
    this.entries.write(data.entries);
  }

  private getValidInMemoryCache(header: CollectionHeaderType) {
    if (this.inMemoryCache === null || this.inMemoryCache.header.version < header.version) {
      return null;
    }

    return this.inMemoryCache;
  }

  private async readCache(header: CollectionHeaderType): Promise<CacheType<T> | null> {
    const entries = await this.entries.read();
    if (entries === null) return null;

    return {
      entries,
      header,
    };
  }

  clear() {
    this.inMemoryCache = null;
  }

  async load(): Promise<CacheType<T> | null> {
    const header = await this.header.read();
    if (header === null) return this.inMemoryCache;

    return this.getValidInMemoryCache(header) ?? this.readCache(header);
  }
}