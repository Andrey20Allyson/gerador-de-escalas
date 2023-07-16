import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { WorkerRegistriesMap, Holidays } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { utils } from "@andrey-allyson/escalas-automaticas";
import { fromRoot } from "../path.utils";
import fs from 'fs/promises';

export interface AppAssets {
  workerRegistryMap: WorkerRegistriesMap;
  serializer: MainTableFactory;
  holidays: Holidays;
}

export async function loadAssets(): Promise<AppAssets> {
  const holidaysBuffer = await fs.readFile(fromRoot('./assets/holidays.json'));
  const patternBuffer = await fs.readFile(fromRoot('./assets/output-pattern.xlsx'));
  const registriesBuffer = await fs.readFile(fromRoot('./assets/registries.json'));

  const holidays = utils.Result.unwrap(Holidays.safeParse(holidaysBuffer));
  const workerRegistryMap = utils.Result.unwrap(WorkerRegistriesMap.parseJSON(registriesBuffer));

  const serializer = new MainTableFactory(patternBuffer);

  return { holidays, workerRegistryMap, serializer };
}