import { CollectionHeaderType, RegistryEntryType } from '../base'

export interface CacheType<T> {
  header: CollectionHeaderType;
  entries: RegistryEntryType<T>[];
};