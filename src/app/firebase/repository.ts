import { RegistryEntryType } from "../base";

export interface FirebaseRepository<T> {
  getAll(): Promise<RegistryEntryType<T>[]>;
}