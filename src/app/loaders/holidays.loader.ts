import { RegistryEntryType } from "../base/schemas/registry/entry";
import { HolidayType, holidaySchema } from "../base/schemas/registry/holiday";
import { CacheType, DiskCache } from "../cache";
import { HolidaysFirestoreRepository } from "../firebase";
import { Config } from "../utils/config";
import { TypedDiskCache } from "./typed-cache";

export type HodilaysLoaderConfig = Config<{
  repository: HolidaysFirestoreRepository;
  cache: DiskCache<HolidayType>;
}>;

export class HodilaysLoader {
  static readonly createConfig = Config.createStaticFactory<HodilaysLoaderConfig>({
    repository: new HolidaysFirestoreRepository(),
    cache: new TypedDiskCache('holidays', holidaySchema),
  });

  config: Config.From<HodilaysLoaderConfig>;

  constructor(config: Config.Partial<HodilaysLoaderConfig> = {}) {
    this.config = HodilaysLoader.createConfig(config);
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

    const collectionUpdateInfo = await this.repository.getUpdateInfo();

    if (cache && cache.header.version >= collectionUpdateInfo.version) return cache.entries;

    const entries = await this.repository.getAll();

    const updatedCache: CacheType<HolidayType> = {
      header: {
        collectionName: this.repository.collection.id,
        lastUpdate: collectionUpdateInfo.lastUpdate,
        version: collectionUpdateInfo.version,
      },
      entries,
    };

    await this.cache.save(updatedCache);

    return entries;
  }
}