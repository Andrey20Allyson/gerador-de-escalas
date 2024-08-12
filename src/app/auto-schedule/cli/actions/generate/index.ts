import path from "path";
import fs from "fs/promises";
import { ExtraDutyTable, ExtraEventName, WorkerInfo } from "../../../extra-duty-lib";
import { DefaultTableIntegrityAnalyser } from "../../../extra-duty-lib/builders/integrity";
import { FirestoreInitializer } from "../../../firebase/app";
import { parseWorkers } from "../../../io";
import { FirestoreWorkerRegistryRepository } from "../../../persistence/repositories/firestore-worker-registry-repository";
import { Benchmarker, analyseResult } from "../../../utils";
import { env } from "../../../utils/env";
import { Fancyfier, UnassignedWorkersMessageData } from "../../../utils/fancyfier";
import { MockFactory } from "../../mock";
import { RandomWorkerMockFactory } from "../../mock/worker/random";
import { z } from "zod";
import { DEFAULT_MONTH_PARSER } from "../../../extra-duty-lib/structs/month";
import { MultiEventScheduleBuilder } from '../../../extra-duty-lib/builders/multi-event-schedule-builder';
import { SerializationContext } from "../../../schedule-serialization/serializers/serialization-context";
import { DivulgationSerializationStratergy } from "../../../schedule-serialization/serializers/stratergies/divulgation-serialization-stratergy";

export const generateOptionsSchema = z.object({
  mode: z
    .enum(['input-file', 'mock'])
    .optional(),
  input: z
    .string()
    .optional(),
  output: z
    .string()
    .optional(),
  tries: z
    .number({ coerce: true })
    .optional(),
  date: z
    .string({ required_error: `Can't run with out the date, pass -d or --date config` })
    .transform(s => DEFAULT_MONTH_PARSER.parse(s))
});

export type GenerateCommandOptions = z.infer<typeof generateOptionsSchema>;

const KEY_DECRYPT_PASSWORD = env('KEY_DECRYPT_PASSWORD');

function mockWorkers(year: number, month: number) {
  const workerMocker: MockFactory<WorkerInfo> = new RandomWorkerMockFactory({ month, year });

  return workerMocker.array(28);
}

async function loadWorkers(year: number, month: number, inputFile: string) {
  const inputBuffer = await fs.readFile(inputFile);

  const initializer = new FirestoreInitializer({ password: KEY_DECRYPT_PASSWORD });
  const firestore = await initializer.getFirestore();

  const loader = new FirestoreWorkerRegistryRepository({ cacheOnly: true, firestore });
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

  const builder = MultiEventScheduleBuilder.default({ tries });

  builder.build(table, workers);

  tableAssignBenchmark.end();

  const analisysString = analyseResult(table);
  console.log(analisysString);

  const analyser = new DefaultTableIntegrityAnalyser(undefined, [
    ExtraEventName.JIQUIA,
    // ExtraEventName.JARDIM_BOTANICO_DAYTIME,
  ]);

  const integrity = analyser.analyse(table);

  const fancyfier = new Fancyfier();
  fancyfier.log(new UnassignedWorkersMessageData(table, workers, [ExtraEventName.JIQUIA]));

  fancyfier.log(beckmarker);
  fancyfier.log(integrity);
  console.log(`pode ser utilizado: ${integrity.isCompliant()}`);

  if (outputFile) {
    const outBuffer = await SerializationContext
      .using(DivulgationSerializationStratergy)
      .serialize(table);

    const outputFileWithExt = path.extname(outputFile) === '.xlsx'
      ? outputFile
      : outputFile + '.xlsx';

    fs.writeFile(path.resolve(outputFileWithExt), outBuffer);
  }
}