import { RegistryEntryType } from "../base/schemas/registry/registry";
import { CacheType, DiskCache } from "../cache";
import { CollectionHandler, RepositoryReader } from "../repositories/repository";

export interface LoaderRepository<T = unknown> extends RepositoryReader<T>, CollectionHandler { }

export type TypedLoaderConfig<T = unknown> = {
  saveInCache?: boolean;
  repository: LoaderRepository<T>;
  cache: DiskCache<T>;
}

export class TypedLoader<T> {
  readonly saveInCache: boolean;
  readonly repository: LoaderRepository<T>;
  readonly cache: DiskCache<T>;

  constructor(config: TypedLoaderConfig<T>) {
    const {
      cache,
      repository,
      saveInCache = true,
    } = config;

    this.saveInCache = saveInCache
    this.cache = cache;
    this.repository = repository;
  }

  async reload(): Promise<RegistryEntryType<T>[]> {
    this.cache.clear();

    return this.load();
  }

  async load(): Promise<RegistryEntryType<T>[]> {
    const cache = await this.cache.load();

    let collectionHeader = await this.repository.getHeader().catch(r => console.warn(r));
    if (collectionHeader === undefined) return cache?.entries ?? [];

    if (cache && cache.header.version >= collectionHeader.version) return cache.entries;

    const entries = await this.repository.getFromQuery(this.repository.collection);

    const updatedCache: CacheType<T> = {
      header: collectionHeader,
      entries,
    };

    await this.cache.save(updatedCache);

    return entries;
  }
}