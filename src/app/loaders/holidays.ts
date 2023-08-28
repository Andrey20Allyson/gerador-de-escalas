import { CacheType, loadCache, saveCache } from "../cache";
import { HolidayType, HolidaysFirestoreRepository, holidaySchema } from "../firebase/holidays.repository";
import { createStaticConfigFactory } from "../utils";

export interface HodilaysLoaderConfig {
  repository: HolidaysFirestoreRepository;
  cacheFileName: string;
}

export class HodilaysLoader {
  static createConfig = createStaticConfigFactory<HodilaysLoaderConfig>({
    repository: new HolidaysFirestoreRepository(),
    cacheFileName: 'holidays',
  });
  config: HodilaysLoaderConfig;
  inMemoryCache: CacheType<HolidayType> | null;

  constructor(config: Partial<HodilaysLoaderConfig> = {}) {
    this.config = HodilaysLoader.createConfig(config);

    this.inMemoryCache = null;
  }

  clear() {
    this.inMemoryCache = null;
  }

  async reload(): Promise<HolidayType[]> {
    this.clear();

    return this.load();
  }

  async load(): Promise<HolidayType[]> {
    const inDiskCache = await loadCache<HolidayType>(this.config.cacheFileName, holidaySchema);

    if (this.inMemoryCache) {
      const isInMemoryCacheUpToDate = inDiskCache
        ? this.inMemoryCache.version >= inDiskCache.version
        : true;

      if (isInMemoryCacheUpToDate) return this.inMemoryCache.data;
    }

    const collectionUpdateInfo = await this.config.repository.getUpdateInfo();

    if (inDiskCache && inDiskCache.version >= collectionUpdateInfo.version) {
      this.inMemoryCache = inDiskCache;

      return inDiskCache.data;
    }

    const data = await this.config.repository.getAll();

    this.inMemoryCache = {
      collectionName: this.config.repository.config.holidaysCollection.id,
      lastUpdate: collectionUpdateInfo.lastUpdate,
      version: collectionUpdateInfo.version,
      data,
    };

    await saveCache(this.config.cacheFileName, this.inMemoryCache);

    return data;
  }
}