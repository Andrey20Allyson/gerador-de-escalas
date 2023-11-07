import pfs from 'fs/promises';
import path from 'path';
import { BufferReducer, DataTransformer } from './data-transformer';
import { CacheIO } from "./io";
import { PromiseOrNot } from './types';

export type DefaultCacheIOPFS = Pick<typeof pfs,
  | 'readFile'
  | 'writeFile'
  | 'access'
  | 'mkdir'
>;

export type CacheIOParser<T> = (data: Buffer) => PromiseOrNot<T>;
export type CacheIOSerializer<T> = (data: T) => PromiseOrNot<Buffer>;

export interface DefaultCacheIOConfig<T> {
  parser: CacheIOParser<T>;
  namespace: string;
  serializer?: CacheIOSerializer<T>;
  pfs?: DefaultCacheIOPFS;
  preParse?: BufferReducer | BufferReducer[];
  postSerialize?: BufferReducer | BufferReducer[];
  directory?: string;
  extname?: string;
}

export function jsonToBuffer(data: unknown): Buffer {
  const str = JSON.stringify(data);

  return Buffer.from(str);
}

export class DefaultCacheIO<T> implements CacheIO<T> {
  readonly parser: CacheIOParser<T>;
  readonly serializer: CacheIOSerializer<T>;
  readonly preParse: DataTransformer;
  readonly postSerialize: DataTransformer;
  readonly pfs: DefaultCacheIOPFS;
  readonly directory: string;
  readonly extname: string;
  readonly namespace: string;

  constructor(config: DefaultCacheIOConfig<T>) {
    const {
      namespace,
      parser,
      directory = '.cache',
      extname = 'json',
      pfs: _pfs = pfs,
      serializer = jsonToBuffer,
      preParse = [],
      postSerialize = [],
    } = config;

    this.parser = parser;
    this.namespace = namespace;
    this.directory = directory;
    this.serializer = serializer;
    this.pfs = _pfs;
    this.extname = extname;
    this.preParse = DataTransformer.from(preParse);
    this.postSerialize = DataTransformer.from(postSerialize);
  }

  getPath() {
    return path.resolve(this.directory, `${this.namespace}.${this.extname}`);
  }

  private async createCacheDirectoryIfDontExist() {
    try {
      await this.pfs.access(this.directory);
    } catch {
      this.pfs.mkdir(this.directory);
    }
  }

  getPostSerialize(): DataTransformer {
    return this.postSerialize;
  }

  getPreParse(): DataTransformer {
    return this.preParse;
  }

  async write(data: T): Promise<void> {
    const path = this.getPath();

    this.createCacheDirectoryIfDontExist();

    const initialBuffer = await this.serializer(data);
    const transformedBuffer = await this.postSerialize.transform(initialBuffer);

    return this.pfs.writeFile(path, transformedBuffer);
  }

  async read(): Promise<T | null> {
    const path = this.getPath();

    try {
      const initialBuffer = await this.pfs.readFile(path);
      const transformedBuffer = await this.preParse.transform(initialBuffer);

      return this.parser(transformedBuffer);
    } catch {
      return null;
    }
  }
}