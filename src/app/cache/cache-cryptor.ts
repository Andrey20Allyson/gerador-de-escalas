import CryptorWithPassword from "../cryptor/cryptor-with-password";
import { BufferReducerObject } from "./data-transformer";
import { PromiseOrNot } from "./types";

export class CacheEncryptor implements BufferReducerObject {
  constructor(
    readonly cryptor: CryptorWithPassword,
  ) { }

  reduce(data: Buffer): PromiseOrNot<Buffer> {
    return this.cryptor.encrypt(data);
  }
}

export class CacheDecryptor implements BufferReducerObject {
  constructor(
    readonly cryptor: CryptorWithPassword,
  ) { }

  reduce(data: Buffer): PromiseOrNot<Buffer> {
    return this.cryptor.decrypt(data);
  }
}