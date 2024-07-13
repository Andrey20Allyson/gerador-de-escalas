import fs from 'fs/promises';
import { Holidays } from "../auto-schedule/extra-duty-lib";
import { FirestoreInitializer } from "../auto-schedule/firebase/app";
import { WorkerRegistry, WorkerRegistryMap, WorkerRegistryRepository } from "../auto-schedule/persistence/entities/worker-registry";
import { MainTableFactory } from "../auto-schedule/xlsx-builders";
import { fromRoot } from "../path.utils";
import { AssetsErrorCode } from "./assets.error";
import { AppResponse } from "./mapping/response";
import { FirestoreWorkerRegistryRepository } from '../auto-schedule/persistence/repositories/firestore-worker-registry-repository';

export type AppAssetsServices = {
  readonly workerRegistry: WorkerRegistryServices;
}

export type WorkerRegistryServices = {
  readonly repository: WorkerRegistryRepository;
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
        workerRegistry: {
          repository: new FirestoreWorkerRegistryRepository({ firestore }),
        }
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
}