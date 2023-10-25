import { BufferReducer, DataTransformer } from "./data-transformer";

export interface CacheIO<T> {
  write(data: T): Promise<void>;
  read(): Promise<T | null>;
  getPostSerialize(): DataTransformer;
  getPreParse(): DataTransformer;
}