import { CollectionHeaderType, RegistryEntryType } from '../base';
import { BufferReducer } from './data-transformer';
import { CacheIO } from './io';
import { CacheType } from './types';

export interface DiskCacheConfig<T = unknown> {
  entries: CacheIO<RegistryEntryType<T>[]>;
  header: CacheIO<CollectionHeaderType>;
  useInMemoryCache?: boolean;
}

export class DiskCache<T = unknown> {
  inMemoryCache: CacheType<T> | null;

  useInMemoryCache: boolean;
  entries: CacheIO<RegistryEntryType<T>[]>;
  header: CacheIO<CollectionHeaderType>;

  constructor(config: DiskCacheConfig<T>) {
    const {
      entries,
      header,
      useInMemoryCache = false,
    } = config;

    this.useInMemoryCache = useInMemoryCache;
    this.entries = entries;
    this.header = header;

    this.inMemoryCache = null;
  }

  appendPreParse(reducer: BufferReducer) {
    this.entries
      .getPreParse()
      .append(reducer);

    this.header
      .getPreParse()
      .append(reducer);

    return this;
  }

  appendPostSerialize(reducer: BufferReducer): this {
    this.entries
      .getPostSerialize()
      .append(reducer);

    this.header
      .getPostSerialize()
      .append(reducer);

    return this;
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