import { Holidays } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib/structs";
import fs from 'fs/promises';
import { ZodType } from 'zod';
import { Collection } from "../firebase";
import { HolidayType, holidaySchema } from "./holidays.schema";

export type GetFileResult<T, E = unknown> = {
  ok: false;
  error: E;
} | {
  ok: true;
  data: T;
};

async function getLocalAsset<T>(name: string, schema: ZodType<T>): Promise<GetFileResult<T>> {
  try {
    const buffer = await fs.readFile(`./assets/${name}.json`, { encoding: 'utf-8' });

    const json = JSON.parse(buffer);
    const typeCheckedJson = schema.parse(json);

    return { ok: true, data: typeCheckedJson };
  } catch (error) {
    return { ok: false, error };
  }
}

function createConfig<T extends object>(partialConfig: Partial<T>, defaultConfig: T): T {
  const newConfig: Partial<T> = {};

  const rawKeys = [
    ...Object.getOwnPropertyNames(partialConfig),
    ...Object.getOwnPropertySymbols(partialConfig),
    ...Object.getOwnPropertyNames(defaultConfig),
    ...Object.getOwnPropertySymbols(defaultConfig),
  ] as Array<keyof T>;

  const keys = new Set(rawKeys);

  for (const key of keys) {
    const value = partialConfig[key] ?? defaultConfig[key];

    if (typeof value === 'object' && value !== null) {
      newConfig[key] = createConfig(partialConfig[key] ?? {}, defaultConfig[key]);
      continue;
    }
    
    newConfig[key] = value;
  }

  return newConfig as T;
}

type StaticConfigFactory<T> = (partialConfig: Partial<T>) => T;

createConfig.fromStaticDefault = function <T extends object>(defaultConfig: T): StaticConfigFactory<T> {
  return partial => createConfig(partial, defaultConfig);
}

export interface HodilaysLoaderConfig {
  firestoreCollection: FirebaseFirestore.CollectionReference;
  assetFileName: string;
}

export class HodilaysLoader {
  static createConfig = createConfig.fromStaticDefault<HodilaysLoaderConfig>({
    firestoreCollection: Collection.holidays,
    assetFileName: 'holidays',
  });
  config: HodilaysLoaderConfig;
  loaded: Holidays | null;

  constructor(config: Partial<HodilaysLoaderConfig> = {}) {
    this.config = HodilaysLoader.createConfig(config);

    this.loaded = null;
  }

  async load() {
    const localData = await getLocalAsset<HolidayType>(this.config.assetFileName, holidaySchema);

    if (localData.ok) {
      
    }
  }

  async save() {

  }

  private async loadLocal() {

  }

  private async loadDB() {

  }

  private async saveLocal() {

  }

  private async saveInDB(holiday: HolidayType) {

  }
}