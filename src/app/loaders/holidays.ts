import { Holiday, Holidays } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib/structs";
import { Collection } from "../firebase";
import fs from 'fs/promises';
import zod, { ZodType } from 'zod';

export interface HodilaysLoaderConfig {
  firestoreCollection: FirebaseFirestore.CollectionReference;
}

type GetFileResult<T> = {
  ok: false;
} | {
  ok: true;
  asset: T;
};

async function getLocalAsset<T>(name: string, schema: ZodType<T>): Promise<GetFileResult<T>> {
  try {
    const buffer = await fs.readFile(`./assets/${name}.json`, { encoding: 'utf-8' });

    const json = JSON.parse(buffer);
    const typeCheckedJson = schema.parse(json);

    return { ok: true, asset: typeCheckedJson };
  } catch {

    return { ok: false };
  }
}

export class HodilaysLoader {
  config: HodilaysLoaderConfig;
  loaded: Holidays | null;

  constructor(config: Partial<HodilaysLoaderConfig> = {}) {
    const {
      firestoreCollection = Collection.holidays,
    } = config;

    this.config = { firestoreCollection };

    this.loaded = null;
  }

  async load() {

  }

  async save() {

  }

  private async loadLocal() {

  }

  private async loadDB() {

  }

  private async saveLocal() {

  }

  private async saveInDB(holiday: Holiday) {

  }
}