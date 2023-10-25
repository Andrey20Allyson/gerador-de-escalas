import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { Holidays, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import fs from 'fs/promises';
import { HolidayType, RegistryEntryType, WorkerRegistry, holidaySchema, workerRegistrySchema } from "../base";
import { TypedDiskCache } from "../cache/typed-cache";
import { Collection } from "../firebase";
import { TypedLoader } from "../loaders/typed-loader";
import { fromRoot } from "../path.utils";
import { TypedRepository } from "../repositories/typed-repository";

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
    super(`App assets hasn't loaded yet!`);
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
    if (this._services === null) throw new AppAssetsNotLoadedError();
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

  async unlock(password: string) {

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

export class WorkerRegistryService {
  repository: TypedRepository<WorkerRegistry>;
  cache: TypedDiskCache<WorkerRegistry>;
  loader: TypedLoader<WorkerRegistry>;

  constructor() {
    this.repository = new TypedRepository({
      collection: Collection.workerRegistries,
      schema: workerRegistrySchema,
    });

    this.cache = new TypedDiskCache({
      prefix: 'worker-registries',
      schema: workerRegistrySchema,
    });

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

  constructor() {
    this.repository = new TypedRepository({
      collection: Collection.holidays,
      schema: holidaySchema,
    });

    this.cache = new TypedDiskCache({
      prefix: 'holidays',
      schema: holidaySchema,
    });

    this.loader = new TypedLoader({
      cache: this.cache,
      repository: this.repository,
    });
  }
}