import { CacheType, DiskCache } from "../cache";
import { HolidayType, HolidaysFirestoreRepository, holidaySchema } from "../firebase";
import { Config } from "../utils/config";

export type HodilaysLoaderConfig = Config<{
  repository: HolidaysFirestoreRepository;
  diskCache: DiskCache<HolidayType>;
  saveCacheInMemory: boolean;
}>;

export class HodilaysLoader {
  static readonly createConfig = Config.createStaticFactory<HodilaysLoaderConfig>({
    repository: new HolidaysFirestoreRepository(),
    diskCache: new DiskCache({
      dataSchema: holidaySchema,
      name: 'holidays',
    }),
    saveCacheInMemory: true,
  });

  config: Config.From<HodilaysLoaderConfig>;
  inMemoryCache: CacheType<HolidayType> | null;

  constructor(config: Config.Partial<HodilaysLoaderConfig> = {}) {
    this.config = HodilaysLoader.createConfig(config);

    this.inMemoryCache = null;
  }

  get repository() {
    return this.config.repository;
  }

  get diskCache() {
    return this.config.diskCache;
  }

  clear() {
    this.inMemoryCache = null;
  }

  saveInMemoryCache(cache: CacheType<HolidayType>) {
    if (this.config.saveCacheInMemory) this.inMemoryCache = cache;
  }

  getInMemoryCache(): CacheType<HolidayType> | null {
    return this.inMemoryCache;
  }

  async reload(): Promise<HolidayType[]> {
    this.clear();

    return this.load();
  }

  async load(): Promise<HolidayType[]> {
    const inDiskCache = await this.diskCache.load();
    const inMemoryCache = this.getInMemoryCache();

    if (inMemoryCache) {
      const isInMemoryCacheUpToDate = inDiskCache
        ? inMemoryCache.version >= inDiskCache.version
        : true;

      if (isInMemoryCacheUpToDate) return inMemoryCache.data;
    }

    const collectionUpdateInfo = await this.repository.getUpdateInfo();

    if (inDiskCache && inDiskCache.version >= collectionUpdateInfo.version) {
      this.inMemoryCache = inDiskCache;

      return inDiskCache.data;
    }

    const data = await this.repository.getAll();

    const cache: CacheType<HolidayType> = {
      collectionName: this.repository.config.collection.id,
      lastUpdate: collectionUpdateInfo.lastUpdate,
      version: collectionUpdateInfo.version,
      data,
    };

    this.saveInMemoryCache(cache);
    await this.diskCache.save(cache);

    return data;
  }
}