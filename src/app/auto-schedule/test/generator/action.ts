import fs from 'fs/promises';
import path from "path";
import { GenerateCommandOptions } from ".";
import { parseWorkers } from "../../io/io";
import { MainTableFactory } from "../../xlsx-builders";
import { ExtraDutyTable, ExtraEventName, WorkerInfo } from "../../extra-duty-lib";
import { DefautlScheduleBuilder } from "../../extra-duty-lib/builders/default-builder";
import { DefaultTableIntegrityAnalyser } from "../../extra-duty-lib/builders/integrity";
import { Benchmarker, analyseResult } from "../../utils";
import { Fancyfier, UnassignedWorkersMessageData } from "../../utils/fancyfier";
import { MockFactory } from "./mock";
import { RandomWorkerMockFactory } from "./mock/worker/random";
import { WorkerRegistryRepository } from '../../registries/worker-registry/repository';
import { FirestoreInitializer } from '../../firebase/app';
import { env } from '../../utils/env';

const KEY_DECRYPT_PASSWORD = env('KEY_DECRYPT_PASSWORD');

function mockWorkers(year: number, month: number) {
  const workerMocker: MockFactory<WorkerInfo> = new RandomWorkerMockFactory({ month, year });

  return workerMocker.array(28);
}

async function loadWorkers(year: number, month: number, inputFile: string) {
  const inputBuffer = await fs.readFile(inputFile);

  const initializer = new FirestoreInitializer({ password: KEY_DECRYPT_PASSWORD });
  const firestore = await initializer.getFirestore();
  const collection = firestore.collection('worker-registries');

  const loader = new WorkerRegistryRepository({ cacheOnly: true, collection });
  const workerRegistries = await loader.load();

  return parseWorkers(inputBuffer, {
    workerRegistries,
    month,
    year,
  });
}

export async function generate(options: GenerateCommandOptions) {
  const {
    mode = options.input !== undefined ? 'input-file' : 'mock',
    input: inputFile = 'input/data.xlsx',
    tries = 7000,
    output: outputFile,
    date: month,
  } = options;

  const beckmarker = new Benchmarker({ metric: 'sec' });

  let workers = mode === 'mock'
    ? mockWorkers(month.year, month.index)
    : await loadWorkers(month.year, month.index, inputFile);

  const table = new ExtraDutyTable({
    year: month.year,
    month: month.index,
  });

  const tableAssignBenchmark = beckmarker.start('talbe assign');

  const builder = new DefautlScheduleBuilder(tries);

  builder.build(table, workers);

  tableAssignBenchmark.end();

  const analisysString = analyseResult(table);
  console.log(analisysString);

  const analyser = new DefaultTableIntegrityAnalyser();

  const integrity = analyser.analyse(table);

  const fancyfier = new Fancyfier();
  fancyfier.log(new UnassignedWorkersMessageData(table, workers, [
    ExtraEventName.JIQUIA,
    ExtraEventName.JARDIM_BOTANICO_DAYTIME,
    ExtraEventName.SUPPORT_TO_CITY_HALL,
  ]));

  fancyfier.log(beckmarker);
  fancyfier.log(integrity);
  console.log(`pode ser utilizado: ${integrity.isCompliant()}`);

  if (outputFile) {
    const pattern = await fs.readFile('input/output-pattern.xlsx');

    const factory = new MainTableFactory(pattern);

    const outBuffer = await factory.generate(table, { sheetName: 'DADOS' });

    const outputFileWithExt = path.extname(outputFile) === '.xlsx'
      ? outputFile
      : outputFile + '.xlsx';

    fs.writeFile(path.resolve(outputFileWithExt), outBuffer);
  }
}