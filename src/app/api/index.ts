import { ExtraDutyTableV2, Holidays, generate, io, utils } from '@andrey-allyson/escalas-automaticas';
import { parseWorkers } from '@andrey-allyson/escalas-automaticas/dist/auto-schedule/io';
import { MainTableFactory } from '@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories/main-factory';
import { WorkerInfo } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info';
import { WorkerRegistriesMap } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-registries';
import { analyseResult } from '@andrey-allyson/escalas-automaticas/dist/utils/analyser';
import fs from 'fs/promises';
import { fromRoot } from '../root-path';
import { handleIPC } from './app-ipc';
import { AppHandlerObject } from './channels';
import { setPrototypesOfWorkers } from './ipc-utils';
import { GeneratorStatus, SaveWorkersDaysOfWorkStatus } from './status';

interface GeneratorData {
  workers: WorkerInfo[];
  sheetName: string;
  buffer: Buffer;
  month: number;
}

function* keys<O extends {}>(object: O): Iterable<keyof O> {
  for (const k in object) {
    yield k;
  }
}

function handleAppIPCChannels(handler: AppHandlerObject) {
  for (const key of keys(handler)) {
    handleIPC(key, handler[key] as Parameters<typeof handleIPC>[1]);
  }
}

export async function loadAPI(debug = false) {
  const holidaysBuffer = await fs.readFile(fromRoot('./assets/holidays.json'));
  const patternBuffer = await fs.readFile(fromRoot('./assets/output-pattern.xlsx'));
  const registriesBuffer = await fs.readFile(fromRoot('./assets/registries.json'));

  const holidays = utils.Result.unwrap(Holidays.safeParse(holidaysBuffer));
  const workerRegistryMap = utils.Result.unwrap(WorkerRegistriesMap.parseJSON(registriesBuffer));

  let loadedData: GeneratorData | undefined;
  let outputBuffer: ArrayBuffer | undefined;

  const tableFactory = new MainTableFactory(patternBuffer);

  handleAppIPCChannels({
    async changeWorkerDayOfWork(ev, workerIndex, day, value) {
      const worker = loadedData?.workers.at(workerIndex);
      if (!worker) return;

      if (value) {
        worker.daysOfWork.work(day);
      } else {
        worker.daysOfWork.notWork(day);
      }
    },

    async changeWorkerInfo(ev, index, newState) {

    },

    async generate(ev, filePath, sheetName, month) {
      const input = await fs.readFile(filePath);
      const output = await generate(input, {
        inputSheetName: sheetName,
        outputSheetName: 'DADOS',
        month: +month,
        workerRegistryMap,
        patternBuffer,
        holidays,
      });

      return output;
    },

    async generateWithLoaded(ev) {
      try {
        if (!loadedData) return GeneratorStatus.DATA_NOT_LOADED_ERROR;
        const { month, workers } = loadedData;

        const table = new ExtraDutyTableV2({ month });

        const success = table.tryAssignArrayMultipleTimes(workers, 500);
        if (!success) return GeneratorStatus.ASSIGN_ERROR;

        if (debug) {
          console.log(analyseResult(table, workers));
        }

        const buffer = await tableFactory.generate(table, {
          sheetName: 'DADOS',
        });

        for (const worker of workers) {
          worker.resetPositionsLeft();
        }

        outputBuffer = new Uint8Array(buffer).buffer;

        return GeneratorStatus.OK;
      } catch (e) {
        console.error(e);
        return GeneratorStatus.UNKNOW_ERROR;
      }
    },

    async getGeneratedArrayBuffer(ev) {
      return outputBuffer;
    },

    async getLoadedData(ev) {
      if (!loadedData) return;

      return {
        month: loadedData.month,
        workers: loadedData.workers,
        sheetName: loadedData.sheetName,
      };
    },

    async getSheetNames(ev, filePath) {
      return await io.loadSheetNames(filePath);
    },

    async getWorkerInfo(ev) {
      return loadedData?.workers;
    },

    async loadData(ev, filePath, sheetName, month) {
      try {
        const buffer = await fs.readFile(filePath);

        const workers = parseWorkers(buffer, {
          workerRegistryMap,
          sheetName,
          holidays,
          month,
        });

        loadedData = {
          sheetName,
          workers,
          buffer,
          month,
        };
      } catch (e) {
        if (e instanceof Error) return e;

        return new Error(`Unknown error: "${String(e)}"`);
      }
    },

    async saveWorkersDaysOfWork(ev, workers) {
      try {
        if (!loadedData) return SaveWorkersDaysOfWorkStatus.DATA_NOT_LOADED_ERROR;

        if (loadedData.workers.length !== workers.length) return SaveWorkersDaysOfWorkStatus.ARRAY_LENGTH_ERROR;

        setPrototypesOfWorkers(workers);

        for (let i = 0; i < workers.length; i++) {
          const { daysOfWork } = loadedData.workers[i];
          const newDaysOfWork = workers[i].config.daysOfWork;

          for (let day = 0; day < daysOfWork.length; day++) {
            if (newDaysOfWork.workOn(day)) {
              daysOfWork.work(day);
            } else {
              daysOfWork.notWork(day);
            }
          }
        }

        return SaveWorkersDaysOfWorkStatus.OK;
      } catch (e) {
        console.error(e);
        return SaveWorkersDaysOfWorkStatus.UNKNOWN_ERROR;
      }
    },
  });
}