import { ZodType } from "zod";
import { RegistryEntryType } from "../base/schemas/registry/registry";
import { CacheType, DiskCache } from "../cache";
import { TypedDiskCache, TypedDiskCacheConfig } from "../cache/typed-cache";
import { CollectionHandler, RepositoryReader } from "../repositories/repository";
import { TypedRepository, TypedRepositoryConfig } from "../repositories/typed-repository";
import { Config } from "../utils/config";

export interface LoaderRepository<T = unknown> extends RepositoryReader<T>, CollectionHandler { }

export type DependencyConfig<DC> = {
  [K in keyof DC]: {
    contains: K;
    content: DC[K];
  }
}[keyof DC];

export type TypedLoaderConfig<T = unknown> = Config<{
  saveInCache: boolean;
  schema: ZodType<T>;
  repository: DependencyConfig<{
    instance: LoaderRepository<T>;
    config: Config.Partial<TypedRepositoryConfig<T>>;
  }>;
  cache: DependencyConfig<{
    instance: DiskCache<T>;
    config: Config.PartialWithOut<TypedDiskCacheConfig<T>, 'schema'>;
  }>;
},
  | 'schema'
  | 'cache'
  | 'repository'
>;

export class TypedLoader<T> {
  static defaults: Config.Defaults<TypedLoaderConfig> = {
    saveInCache: true,
  };

  config: Config.From<TypedLoaderConfig<T>>;
  repository: LoaderRepository<T>;
  cache: DiskCache<T>;

  constructor(config: Config.Partial<TypedLoaderConfig<T>>) {
    this.config = Config.from<TypedLoaderConfig<T>>(config, TypedLoader.defaults);

    this.cache = this.cacheFromConfig();
    this.repository = this.repositoryFromConfig();
  }

  private cacheFromConfig(): DiskCache<T> {
    const { cache, schema } = this.config;

    switch (cache.contains) {
      case "config":
        type I = Config.Intersection<TypedDiskCacheConfig<T>, 'schema'>;

        return new TypedDiskCache(Config.intersection<I>(cache.content, {
          schema,
        }));
      case "instance":
        return cache.content;
    }
  }

  private repositoryFromConfig(): LoaderRepository<T> {
    const { repository } = this.config;

    switch (repository.contains) {
      case "config":
        return new TypedRepository(repository.content);
      case "instance":
        return repository.content;
    }
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