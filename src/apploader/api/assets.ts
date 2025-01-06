import fs from 'fs/promises';
import { Holidays } from "../auto-schedule/extra-duty-lib";
import { FirestoreInitializer } from "../auto-schedule/firebase/app";
import { WorkerRegistryMap, WorkerRegistryRepository } from "../auto-schedule/persistence/entities/worker-registry";
import { MainTableFactory } from "../auto-schedule/xlsx-builders";
import { fromRoot } from "../../utils/fromRoot";
import { AssetsErrorCode } from "./assets.error";
import { AppResponse } from "./mapping/response";
import { FirestoreWorkerRegistryRepository } from '../auto-schedule/persistence/repositories/firestore-worker-registry-repository';
import { SerializationStratergy } from '../auto-schedule/schedule-serialization/serializers/serialization-stratergy';
import { DivulgationSerializationStratergy } from '../auto-schedule/schedule-serialization/serializers/stratergies/divulgation-serialization-stratergy';
import { env } from '../utils/env';
import { AppError } from './mapping/error';

export type AppAssetsServices = {
  readonly workerRegistry: WorkerRegistryServices;
}

export type WorkerRegistryServices = {
  readonly repository: WorkerRegistryRepository;
}

export interface AppAssetsData {
  workerRegistryMap: WorkerRegistryMap;
  serializationStratergy: SerializationStratergy;
  patternBuffer: Buffer;
  holidays: Holidays;
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
  private _data: AppAssetsData | null = null;
  private _services: AppAssetsServices | null = null;

  constructor() { }

  async unlockWithEnv(): Promise<void> {
    const password = env.optional('KEY_DECRYPT_PASSWORD');
    if (password == null) {
      return;
    }

    const unlockResult = await this.unlockServices(password);
    if (unlockResult.ok === false) {
      return;
    }

    await this.load();
  }

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

  get serializationStratergy() {
    return this.data.serializationStratergy;
  }

  get paymentPatternBuffer() {
    return this.data.patternBuffer;
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
    const serializationStratergy = new DivulgationSerializationStratergy('DADOS');

    this._data = {
      holidays,
      patternBuffer,
      serializationStratergy,
      workerRegistryMap,
    };
  }

  reload() {

  }
}