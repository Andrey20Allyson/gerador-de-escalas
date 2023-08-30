export interface CacheIO<T> {
  write(data: T): Promise<void>;
  read(): Promise<T | null>;
}