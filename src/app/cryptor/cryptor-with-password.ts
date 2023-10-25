import { Config } from "../utils/config";
import crypto from 'crypto';

export type NumberRange = {
  start: number;
  end: number;
};

export type PartialNumberRange = {
  start: number;
  end?: number;
}

export type CryptorWithPasswordConfig = Config<{
  keyGenIterations: number;
  password: string;
  saltSize: number;
}, 'password'>;

export type ExtractedBuffers = {
  encryptedBuffer: Buffer;
  salt: Buffer;
  iv: Buffer;
};

export class CryptorWithPasswordInitError extends Error {
  static empityPasswordError() {
    return new this(`password can't be empity`);
  }
}

export type CryptorWithPasswordDecryptErrorCause =
  | 'unknown'
  | 'probable-incorrect-password';

export type CryptorWithPasswordDecryptErrorOptions = {
  cause?: CryptorWithPasswordDecryptErrorCause;
}

export class CryptorWithPasswordDecryptError extends Error {
  cause: CryptorWithPasswordDecryptErrorCause = 'unknown';

  constructor(message?: string, options?: CryptorWithPasswordDecryptErrorOptions) {
    super(message, options);
  }

  static probableIncorrectPasswordError(password: string) {
    return new this(`probably the password "${password}" is incorrect`, { cause: 'probable-incorrect-password' });
  }
}

export default class CryptorWithPassword {
  static readonly CRYPTOGRAPH_ALGORITHM = 'aes-256-cbc';
  static readonly INITIALIZATION_VECTOR_SIZE = 16;
  static readonly PBKD_DIGEST = 'sha256';
  static defaults: Config.Defaults<CryptorWithPasswordConfig> = {
    keyGenIterations: 1e5,
    saltSize: 16,
  };

  private config: Config.From<CryptorWithPasswordConfig>;

  constructor(config: Config.Partial<CryptorWithPasswordConfig>) {
    this.config = Config.from<CryptorWithPasswordConfig>(config, CryptorWithPassword.defaults);

    if (this.config.password.length === 0) {
      throw CryptorWithPasswordInitError.empityPasswordError();
    }
  }

  generateSalt() {
    return crypto.randomBytes(this.config.saltSize);
  }

  generateIV() {
    return crypto.randomBytes(CryptorWithPassword.INITIALIZATION_VECTOR_SIZE);
  }

  getPassword() {
    return this.config.password;
  }

  async getKey(salt: Buffer): Promise<Buffer> {
    return new Promise((res, rej) => {
      crypto.pbkdf2(this.config.password, salt, this.config.keyGenIterations, 32, CryptorWithPassword.PBKD_DIGEST, (err, key) => {
        if (err) return rej(err);

        res(key);
      });
    });
  }

  getSaltRange(): NumberRange {
    return {
      start: 0,
      end: this.config.saltSize
    };
  }

  getIVRange(saltRange: NumberRange = this.getSaltRange()): NumberRange {
    const start = saltRange.end;
    const end = start + CryptorWithPassword.INITIALIZATION_VECTOR_SIZE;

    return { start, end };
  }

  getEncryptedBufferRange(ivRange: NumberRange = this.getIVRange()): PartialNumberRange {
    const start = ivRange.end;

    return { start };
  }

  extractBuffers(data: Buffer): ExtractedBuffers {
    const saltRange = this.getSaltRange();
    const salt = data.subarray(saltRange.start, saltRange.end);

    const ivRange = this.getIVRange(saltRange);
    const iv = data.subarray(ivRange.start, ivRange.end);

    const EBRange = this.getEncryptedBufferRange(ivRange);
    const encryptedBuffer = data.subarray(EBRange.start);

    return { salt, iv, encryptedBuffer };
  }

  async encrypt(data: Buffer) {
    const salt = this.generateSalt();
    const iv = this.generateIV();
    const key = await this.getKey(salt);

    const cipher = crypto.createCipheriv(CryptorWithPassword.CRYPTOGRAPH_ALGORITHM, key, iv);

    const encryptedBuffers = [
      salt,
      iv,
      cipher.update(data),
      cipher.final(),
    ];

    const encriptedBuffer = Buffer.concat(encryptedBuffers);

    return encriptedBuffer;
  }

  async decrypt(data: Buffer) {
    const { encryptedBuffer, iv, salt } = this.extractBuffers(data);

    const key = await this.getKey(salt);

    const decipher = crypto.createDecipheriv(CryptorWithPassword.CRYPTOGRAPH_ALGORITHM, key, iv);

    const decryptedBuffers: Buffer[] = [];

    try {
      decryptedBuffers.push(
        decipher.update(encryptedBuffer),
        decipher.final(),
      );
    } catch (error) {
      throw CryptorWithPasswordDecryptError.probableIncorrectPasswordError(this.config.password);
    }

    const decryptedBuffer = Buffer.concat(decryptedBuffers);

    return decryptedBuffer;
  }
}