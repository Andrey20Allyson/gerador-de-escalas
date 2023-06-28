import { Holidays, generate, io } from '@andrey-allyson/escalas-automaticas';
import fs from 'fs/promises';
import { handleIPC } from './app-ipc';
import { fromRoot } from '../root-path';
import { utils } from '@andrey-allyson/escalas-automaticas';
import { WorkerRegistriesMap } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-registries';
import { parseWorkers } from '@andrey-allyson/escalas-automaticas/dist/auto-schedule/io';
import { WorkerInfo } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info';

interface GeneratorData {
  workers: WorkerInfo[];
  sheetName: string;
  buffer: Buffer;
  month: number;
}

export async function loadAPI() {
  const holidaysBuffer = await fs.readFile(fromRoot('./assets/holidays.json'));
  const patternBuffer = await fs.readFile(fromRoot('./assets/output-pattern.xlsx'));
  const registriesBuffer = await fs.readFile(fromRoot('./assets/registries.json'));

  const holidays = utils.Result.unwrap(Holidays.safeParse(holidaysBuffer));
  const workerRegistryMap = utils.Result.unwrap(WorkerRegistriesMap.parseJSON(registriesBuffer));

  handleIPC('getSheetNames', async (ev, filePath) => {
    return await io.loadSheetNames(filePath);
  });

  let loadedData: GeneratorData | undefined; 

  handleIPC('loadData', async (ev, filePath, sheetName, month) => {
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
  });

  handleIPC('getWorkerInfo', async () => {
    return loadedData?.workers;
  })

  handleIPC('changeWorkerDayOfWork', async (ev, workerIndex, day, value) => {
    const worker = loadedData?.workers.at(workerIndex);
    if (!worker) return;

    if (value) {
      worker.daysOfWork.work(day);
    } else {
      worker.daysOfWork.notWork(day);
    }
  });

  handleIPC('generate', async (ev, filePath, sheetName, month) => {
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
  });
}