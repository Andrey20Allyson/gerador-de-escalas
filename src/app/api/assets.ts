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

export class AppAssets {
  constructor(
    private _workerRegistryMap: WorkerRegistriesMap,
    private _serializer: MainTableFactory,
    private _holidays: Holidays,
    readonly services: AppAssetsServices,
  ) { }

  get workerRegistryMap() {
    return this._workerRegistryMap;
  }

  get serializer() {
    return this._serializer;
  }

  get holidays() {
    return this._holidays;
  }

  reload() {

  }

  static async load(): Promise<AppAssets> {
    const workerService = new WorkerRegistryService();
    const holidaysService = new HolidaysService();

    const holidaysBuffer = await fs.readFile(fromRoot('./assets/holidays.json'));
    const patternBuffer = await fs.readFile(fromRoot('./assets/output-pattern.xlsx'));

    const holidays = utils.Result.unwrap(Holidays.safeParse(holidaysBuffer));

    const registries = await workerService.loader
      .load()
      .then(entities => entities.map(entity => entity.data));

    const workerRegistryMap = new WorkerRegistriesMap(registries);
    const serializer = new MainTableFactory(patternBuffer);

    return new AppAssets(
      workerRegistryMap,
      serializer,
      holidays,
      {
        workerRegistry: workerService,
        holidays: holidaysService,
      }
    );
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