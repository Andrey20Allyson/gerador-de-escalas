import { Config } from "../../utils/config"
import path from 'path';
import pfs from 'fs/promises';
import { CacheIO } from "./io";

export type DefaultCacheIOPFS = Pick<typeof pfs,
  | 'readFile'
  | 'writeFile'
  | 'access'
  | 'mkdir'
>;

type PromiseOrNot<T> = Promise<T> | T; 

export type DefaultCacheIOConfig<T> = Config<{
  serializer: (data: T) => PromiseOrNot<string | Buffer>;
  parser: (data: string) => PromiseOrNot<T>;
  pfs: DefaultCacheIOPFS
  namespace: string;
  directory: string;
  extname: string;
},
  | 'namespace'
  | 'parser'
>;

export class DefaultCacheIO<T> implements CacheIO<T> {
  config: Config.From<DefaultCacheIOConfig<T>>;

  constructor(config: Config.Partial<DefaultCacheIOConfig<T>>) {
    this.config = Config.create<DefaultCacheIOConfig<T>, DefaultCacheIOConfig<T>>(config, {
      serializer: JSON.stringify,
      directory: '.cache',
      extname: 'json',
      pfs,
    });
  }

  getPath() {
    return path.resolve(this.config.directory, `${this.config.namespace}.${this.config.extname}`);
  }

  private async createCacheDirectoryIfDontExist() {
    try {
      await this.config.pfs.access(this.config.directory);
    } catch {
      this.config.pfs.mkdir(this.config.directory);
    }
  }

  async write(data: T): Promise<void> {
    const path = this.getPath();

    this.createCacheDirectoryIfDontExist();

    const buffer = await this.config.serializer(data);

    return this.config.pfs.writeFile(path, buffer);
  }

  async read(): Promise<T | null> {
    const path = this.getPath();

    try {
      const buffer = await this.config.pfs.readFile(path, 'utf-8');

      return this.config.parser(buffer);
    } catch {
      return null;
    }
  }
}