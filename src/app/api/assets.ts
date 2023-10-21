import { utils } from "@andrey-allyson/escalas-automaticas";
import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { Holidays, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import fs from 'fs/promises';
import { HolidayType, WorkerRegistry, holidaySchema, workerRegistrySchema } from "../base";
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

export class AppAssets {
  constructor(
    private data: AppAssetsData,
    readonly services: AppAssetsServices,
  ) { }

  get workerRegistryMap() {
    return this.data.workerRegistryMap;
  }

  get serializer() {
    return this.data.serializer;
  }

  get holidays() {
    return this.data.holidays;
  }

  reload() {

  }

  static async load(): Promise<AppAssets> {
    const workerService = new WorkerRegistryService();
    const holidaysService = new HolidaysService();

    const [
      registries,
      holidaysRegistries,
      patternBuffer,
    ] = await Promise.all([
      workerService.loader
        .load()
        .then(entities => entities.map(entity => entity.data)),

      holidaysService.loader
        .load()
        .then(entities => entities.map(entity => entity.data)),

      fs.readFile(fromRoot('./assets/output-pattern.xlsx')),
    ]);

    const holidays = Holidays.from(holidaysRegistries);
    const workerRegistryMap = new WorkerRegistriesMap(registries);
    const serializer = new MainTableFactory(patternBuffer);

    return new AppAssets({
      workerRegistryMap,
      serializer,
      holidays,
    }, {
      workerRegistry: workerService,
      holidays: holidaysService,
    });
  }
}

export class WorkerRegistryService {
  repository: TypedRepository<WorkerRegistry>
  loader: TypedLoader<WorkerRegistry>;

  constructor() {
    this.repository = new TypedRepository({
      collection: Collection.workerRegistries,
      schema: workerRegistrySchema,
    });

    this.loader = new TypedLoader({
      cache: {
        contains: 'config',
        content: {
          prefix: 'worker-registries',
        },
      },
      repository: {
        contains: 'instance',
        content: this.repository,
      },
      schema: workerRegistrySchema,
    });
  }
}

export class HolidaysService {
  repository: TypedRepository<HolidayType>
  loader: TypedLoader<HolidayType>;

  constructor() {
    this.repository = new TypedRepository({
      collection: Collection.holidays,
      schema: holidaySchema,
    });

    this.loader = new TypedLoader({
      cache: {
        contains: 'config',
        content: {
          prefix: 'holidays',
        },
      },
      repository: {
        contains: 'instance',
        content: this.repository,
      },
      schema: holidaySchema,
    });
  }
}