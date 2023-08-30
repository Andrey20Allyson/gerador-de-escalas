import { HolidayType, holidaySchema } from "../base/schemas/registry/holiday";
import { RegistryEntryType } from "../base/schemas/registry/registry";
import { CacheType, DiskCache } from "../cache";
import { TypedDiskCache } from "../cache/typed-cache";
import { Collection } from "../firebase";
import { CollectionHandler, RepositoryReader } from "../repositories/repository";
import { TypedRepository } from "../repositories/typed-repository";
import { Config } from "../utils/config";

export interface LoaderRepository<T = unknown> extends RepositoryReader<T>, CollectionHandler { }

export type HodilaysLoaderConfig = Config<{
  repository: LoaderRepository<HolidayType>;
  cache: DiskCache<HolidayType>;
}>;

export class HodilaysLoader {
  config: Config.From<HodilaysLoaderConfig>;
  
  constructor(config: Config.Partial<HodilaysLoaderConfig> = {}) {
    this.config = Config.from<HodilaysLoaderConfig>(config, {
      repository: new TypedRepository({
        collection: Collection.holidays,
        schema: holidaySchema
      }),
      cache: new TypedDiskCache({ prefix: 'holidays', schema: holidaySchema }),
    });
  }

  get repository() {
    return this.config.repository;
  }

  get cache() {
    return this.config.cache;
  }

  async reload(): Promise<RegistryEntryType<HolidayType>[]> {
    this.cache.clear();

    return this.load();
  }

  async load(): Promise<RegistryEntryType<HolidayType>[]> {
    const cache = await this.cache.load();

    let collectionHeader = await this.repository.getHeader().catch(r => console.warn(r));
    if (collectionHeader === undefined) return cache?.entries ?? [];

    if (cache && cache.header.version >= collectionHeader.version) return cache.entries;

    const entries = await this.repository.getFromQuery(this.repository.collection);

    const updatedCache: CacheType<HolidayType> = {
      header: collectionHeader,
      entries,
    };

    await this.cache.save(updatedCache);

    return entries;
  }
}