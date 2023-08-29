import { CacheType, loadCache, saveCache } from "../cache";
import { HolidayType, HolidaysFirestoreRepository, holidaySchema } from "../firebase";
import { Config } from "../utils/config";

export type HodilaysLoaderConfig = Config<{
  repository: HolidaysFirestoreRepository;
  cacheFileName: string;
}>;

export class HodilaysLoader {
  static readonly createConfig = Config.createStaticFactory<HodilaysLoaderConfig>({
    repository: new HolidaysFirestoreRepository(),
    cacheFileName: 'holidays',
  });

  config: Config.From<HodilaysLoaderConfig>;
  inMemoryCache: CacheType<HolidayType> | null;

  constructor(config: Config.Partial<HodilaysLoaderConfig> = {}) {
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