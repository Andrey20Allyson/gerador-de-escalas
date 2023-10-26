import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { Holidays, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import fs from 'fs/promises';
import { HolidayType, RegistryEntryType, WorkerRegistry, holidaySchema, workerRegistrySchema } from "../base";
import { TypedDiskCache } from "../cache/typed-cache";
import { TypedLoader } from "../loaders/typed-loader";
import { fromRoot } from "../path.utils";
import { TypedRepository } from "../repositories/typed-repository";
import CryptorWithPassword from "../cryptor/cryptor-with-password";
import { CacheDecryptor, CacheEncryptor } from "../cache/cache-cryptor";
import admin from 'firebase-admin';
import { HOLIDAYS_COLLECTION_NAME, WORKER_REGISTRIES_COLLECTION_NAME } from "../firebase/collections";
import { FirestoreInitializer } from "../firebase";

export interface AppAssetsServices {
  readonly workerRegistry: WorkerRegistryService;
  readonly holidays: HolidaysService;
}

export interface AppAssetsData {
  workerRegistryMap: WorkerRegistriesMap,
  serializer: MainTableFactory,
  holidays: Holidays,
}

export class AppAssetsNotLoadedError extends Error {
  constructor() {
    super(`App assets data hasn't loaded yet!`);
  }
}

export class AppAssetsServicesLockedError extends Error {
  constructor() {
    super(`App assets services hasn't unlocked yet!`);
  }
}

export class AppAssets {
  private static readonly DOT_REGEXP = /\./g;
  private _data: AppAssetsData | null = null;
  private _services: AppAssetsServices | null = null;

  constructor() { }

  private get data() {
    if (this._data === null) throw new AppAssetsNotLoadedError();
    return this._data;
  }

  get services() {
    if (this._services === null) throw new AppAssetsServicesLockedError();
    return this._services;
  }

  get workerRegistryMap() {
    return this.data.workerRegistryMap;
  }

  get serializer() {
    return this.data.serializer;
  }

  get holidays() {
    return this.data.holidays;
  }

  isServicesLocked() {
    return this._services === null;
  }

  async unlockServices(password: string) {
    const initializer = new FirestoreInitializer({ password });

    const firestore = await initializer.getFirestore();

    this._services = {
      holidays: new HolidaysService({ firestore, password }),
      workerRegistry: new WorkerRegistryService({ firestore, password }),
    };
  }

  async load() {
    const [
      registries,
      holidaysRegistries,
      patternBuffer,
    ] = await Promise.all([
      this.services.workerRegistry.loader
        .load()
        .then(AppAssets.mapEntitiesData)
        .then(AppAssets.normalizeWorkersId),

      this.services.holidays.loader
        .load()
        .then(AppAssets.mapEntitiesData),

      fs.readFile(fromRoot('./assets/output-pattern.xlsx')),
    ]);

    const holidays = Holidays.from(holidaysRegistries);
    const workerRegistryMap = new WorkerRegistriesMap(registries);
    const serializer = new MainTableFactory(patternBuffer);

    this._data = {
      holidays,
      serializer,
      workerRegistryMap,
    };
  }

  reload() {

  }

  private static mapEntitiesData<T>(entities: RegistryEntryType<T>[]): T[] {
    return entities.map(entity => entity.data as T);
  }

  private static normalizeWorkersId(registries: WorkerRegistry[]): WorkerRegistry[] {
    return registries.map(registry => ({
      ...registry,
      workerID: registry.workerID.replace(AppAssets.DOT_REGEXP, ''),
    }));
  }
}

export interface ServiceConfig {
  password: string;
  firestore: admin.firestore.Firestore;
}

export class WorkerRegistryService {
  repository: TypedRepository<WorkerRegistry>;
  cache: TypedDiskCache<WorkerRegistry>;
  loader: TypedLoader<WorkerRegistry>;
  cryptor: CryptorWithPassword;

  constructor(config: ServiceConfig) {
    const {
      firestore,
      password,
    } = config;

    this.repository = new TypedRepository({
      firestore,
      collectionName: WORKER_REGISTRIES_COLLECTION_NAME,
      schema: workerRegistrySchema,
    });

    this.cache = new TypedDiskCache({
      prefix: WORKER_REGISTRIES_COLLECTION_NAME,
      schema: workerRegistrySchema,
    });

    this.cryptor = new CryptorWithPassword({ password });

    this.cache
      .appendPostSerialize(new CacheEncryptor(this.cryptor))
      .appendPreParse(new CacheDecryptor(this.cryptor));

    this.loader = new TypedLoader({
      cache: this.cache,
      repository: this.repository,
    });
  }
}

export class HolidaysService {
  repository: TypedRepository<HolidayType>;
  cache: TypedDiskCache<HolidayType>;
  loader: TypedLoader<HolidayType>;
  cryptor: CryptorWithPassword;

  constructor(config: ServiceConfig) {
    const {
      firestore,
      password,
    } = config;

    this.repository = new TypedRepository({
      firestore,
      collectionName: HOLIDAYS_COLLECTION_NAME,
      schema: holidaySchema,
    });

    this.cache = new TypedDiskCache({
      prefix: HOLIDAYS_COLLECTION_NAME,
      schema: holidaySchema,
    });

    this.cryptor = new CryptorWithPassword({ password });

    this.cache
      .appendPostSerialize(new CacheEncryptor(this.cryptor))
      .appendPreParse(new CacheDecryptor(this.cryptor));

    this.loader = new TypedLoader({
      cache: this.cache,
      repository: this.repository,
    });
  }
}