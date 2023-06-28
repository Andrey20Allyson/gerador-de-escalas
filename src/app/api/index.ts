import { Holidays, generate, io } from '@andrey-allyson/escalas-automaticas';
import fs from 'fs/promises';
import { handleIPC } from './app-ipc';
import { fromRoot } from '../root-path';
import { utils } from '@andrey-allyson/escalas-automaticas';
import { WorkerRegistriesMap } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-registries';

export async function loadAPI(dev = false) {
  const holidaysBuffer = await fs.readFile(fromRoot('./assets/holidays.json'));
  const patternBuffer = await fs.readFile(fromRoot('./assets/output-pattern.xlsx'));
  const registriesBuffer = await fs.readFile(fromRoot('./assets/registries.json'));

  const holidays = utils.Result.unwrap(Holidays.safeParse(holidaysBuffer));
  const workerRegistryMap = utils.Result.unwrap(WorkerRegistriesMap.parseJSON(registriesBuffer));

  handleIPC('getSheetNames', async (ev, filePath) => {
    return await io.loadSheetNames(filePath);
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