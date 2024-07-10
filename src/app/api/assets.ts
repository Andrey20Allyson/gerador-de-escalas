import { MainTableFactory } from "../auto-schedule/xlsx-builders";
import { Holidays, WorkerRegistryMap } from "../auto-schedule/extra-duty-lib";
import fs from 'fs/promises';
import { AppResponse, RegistryEntryType } from "../base";
import { fromRoot } from "../path.utils";
import admin from 'firebase-admin';
import { FirestoreInitializer } from "../firebase";
import { AssetsErrorCode } from "./assets.error";
import { WorkerRegistry } from "../auto-schedule/registries/worker-registry";
import { WorkerRegistryRepository } from "../auto-schedule/registries/worker-registry/repository";

export interface AppAssetsServices {
  readonly workerRegistry: WorkerRegistryServices;
}

export interface AppAssetsData {
  workerRegistryMap: WorkerRegistryMap,
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

  async unlockServices(password: string): Promise<AppResponse<void, AssetsErrorCode.INCORRECT_PASSWORD>> {
    const initializer = new FirestoreInitializer({ password });

    try {
      const firestore = await initializer.getFirestore();
  
      this._services = {
        workerRegistry: await WorkerRegistryServices.load({ firestore, password }),
      };

      return AppResponse.ok();
    } catch (err) {
      return AppResponse.error(`The password '${password}' is incorrect!`, AssetsErrorCode.INCORRECT_PASSWORD);
    }
  }

  async load(): Promise<void> {
    const [
      workerRegistryMap,
      patternBuffer,
    ] = await Promise.all([
      this.services.workerRegistry.repository.load(),

      fs.readFile(fromRoot('./assets/output-pattern.xlsx')),
    ]);

    // TODO remove holidays from whole application
    const holidays = Holidays.from([]);
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
      workerID: registry.workerId.replace(AppAssets.DOT_REGEXP, ''),
    }));
  }
}

export interface ServiceConfig {
  password: string;
  firestore: admin.firestore.Firestore;
}

export class WorkerRegistryServices {
  private constructor(
    readonly repository: WorkerRegistryRepository,
  ) { }

  static async load(config: ServiceConfig): Promise<WorkerRegistryServices> {
    const { firestore } = config

    const repositoryCollection = firestore.collection('worker-registries');

    const repository = new WorkerRegistryRepository({
      collection: repositoryCollection,
    });

    const services = new WorkerRegistryServices(
      repository
    );

    return services;
  }
}