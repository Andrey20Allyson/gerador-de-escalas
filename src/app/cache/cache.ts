import fs from 'fs';
import { Config } from '../utils/config';
import { CacheType } from './types';
import { CacheIO } from './io';
import { RegistryEntryType, CollectionHeaderType } from '../base';
import { DefaultCacheIO, DefaultCacheIOConfig } from './default-io';

export type CacheIODependency<T> = {
  contains: 'default-cache-io';
  content: Config.Partial<DefaultCacheIOConfig<T>>;
} | {
  contains: 'dependency';
  content: CacheIO<T>;
}

export type DiskCacheConfig<T = unknown> = Config<{
  entries: CacheIODependency<RegistryEntryType<T>[]>;
  header: CacheIODependency<CollectionHeaderType>;
  useInMemoryCache: boolean;
},
  | 'entries'
  | 'header'
>;

export interface DiskCacheConfigParam<T = unknown> extends Config.Partial<DiskCacheConfig<T>> { };
export interface WatchForUpdatesOptions extends fs.WatchOptions { }

export class DiskCache<T = unknown> {
  inMemoryCache: CacheType<T> | null;

  entries: CacheIO<RegistryEntryType<T>[]>;
  header: CacheIO<CollectionHeaderType>;

  constructor(config: DiskCacheConfigParam<T>) {
    const _config = Config.from<DiskCacheConfig<T>>(config, { useInMemoryCache: true });

    this.entries = this.entriesFromConfig(_config);
    this.header = this.headerFromConfig(_config);

    this.inMemoryCache = null;
  }

  private entriesFromConfig(config: Config.From<DiskCacheConfig<T>>): CacheIO<RegistryEntryType<T>[]> {
    switch (config.entries.contains) {
      case 'default-cache-io':
        return new DefaultCacheIO(config.entries.content);
      case 'dependency':
        return config.entries.content;
    }
  }

  private headerFromConfig(config: Config.From<DiskCacheConfig<T>>): CacheIO<CollectionHeaderType> {
    switch (config.header.contains) {
      case 'default-cache-io':
        return new DefaultCacheIO(config.header.content);
      case 'dependency':
        return config.header.content;
    }
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