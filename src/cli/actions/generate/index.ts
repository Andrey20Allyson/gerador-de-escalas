import path from "path";
import fs from "fs/promises";
import {
  ExtraDutyTable,
  ExtraEventName,
  WorkerInfo,
  DEFAULT_MONTH_PARSER,
  Month,
  Gender,
  Graduation,
} from "src/lib/structs";
import { DefaultTableIntegrityAnalyser } from "src/lib/builders/integrity";
import { FirestoreInitializer } from "src/infra/firebase";
import { FirestoreWorkerRegistryRepository } from "src/lib/persistence/repositories/firestore-worker-registry-repository";
import { Benchmarker, analyseResult } from "src/utils";
import { env } from "src/utils/env";
import { Fancyfier, UnassignedWorkersMessageData } from "src/utils/fancyfier";
import { MockFactory } from "../../mock";
import { RandomWorkerMockFactory } from "../../mock/worker/random";
import { z } from "zod";
import { MultiEventScheduleBuilder } from "src/lib/builders/multi-event-schedule-builder";
import { DivulgationSerializer } from "src/lib/serialization";
import { OrdinaryDeserializer } from "src/lib/serialization/in/impl/ordinary-deserializer";
import { NativeScheduleBuilder } from "src/lib/builders/native-schedule-builder";

export const generateOptionsSchema = z.object({
  mode: z.enum(["input-file", "mock"]).optional(),
  input: z.string().optional(),
  output: z.string().optional(),
  tries: z.number({ coerce: true }).optional(),
  date: z
    .string({
      required_error: `Can't run with out the date, pass -d or --date config`,
    })
    .transform((s) => DEFAULT_MONTH_PARSER.parse(s)),
  useNative: z
    .boolean()
    .or(z.string().transform((str) => str === "true"))
    .optional(),
  useParallelism: z
    .boolean()
    .or(z.string().transform((str) => str === "true"))
    .optional(),
});

export type GenerateCommandOptions = z.infer<typeof generateOptionsSchema>;

const KEY_DECRYPT_PASSWORD = env("KEY_DECRYPT_PASSWORD");

function mockTable(month: Month): ExtraDutyTable {
  const table = new ExtraDutyTable({ month });

  const workerMocker: MockFactory<WorkerInfo> = new RandomWorkerMockFactory({
    month,
  });

  const workers = workerMocker.array(28);

  table.addWorkers(workers);

  return table;
}

async function loadTable(
  month: Month,
  inputFile: string,
): Promise<ExtraDutyTable> {
  const inputBuffer = await fs.readFile(inputFile);

  const initializer = new FirestoreInitializer({
    password: KEY_DECRYPT_PASSWORD,
  });
  const firestore = await initializer.getFirestore();

  const repository = new FirestoreWorkerRegistryRepository({
    cacheOnly: true,
    firestore,
  });

  const deserializer = new OrdinaryDeserializer({
    month,
    workerRegistryRepository: repository,
    sheetName: "Plan1",
  });

  const { schedule } = await deserializer.deserialize(inputBuffer);

  return schedule;
}

function generateSchedule(table: ExtraDutyTable, tries: number) {
  const builder = MultiEventScheduleBuilder.default({ tries });

  builder.build(table);
}

function generateScheduleNative(
  table: ExtraDutyTable,
  tries: number,
  useThreads: boolean = false,
) {
  const builder = new NativeScheduleBuilder({ tries });

  builder.build(table);
}

export async function generate(options: GenerateCommandOptions) {
  const {
    mode = options.input !== undefined ? "input-file" : "mock",
    input: inputFile = "input/data.xlsx",
    tries = 7000,
    output: outputFile,
    date: month,
    useNative = false,
    useParallelism,
  } = options;

  const beckmarker = new Benchmarker({ metric: "sec" });

  let table =
    mode === "mock" ? mockTable(month) : await loadTable(month, inputFile);

  const workers = table.getWorkerList();

  const tableAssignBenchmark = beckmarker.start("talbe assign");

  if (useNative) {
    generateScheduleNative(table, tries, useParallelism);
  } else {
    generateSchedule(table, tries);
  }

  tableAssignBenchmark.end();

  const analisysString = analyseResult(table);
  console.log(analisysString);

  const analyser = new DefaultTableIntegrityAnalyser(undefined, [
    ExtraEventName.JIQUIA,
    // ExtraEventName.JARDIM_BOTANICO_DAYTIME,
  ]);

  const integrity = analyser.analyse(table);

  const fancyfier = new Fancyfier();
  fancyfier.log(
    new UnassignedWorkersMessageData(table, workers, [ExtraEventName.JIQUIA]),
  );

  fancyfier.log(beckmarker);
  fancyfier.log(integrity);
  console.log(`pode ser utilizado: ${integrity.isCompliant()}`);

  if (outputFile) {
    const serializer = new DivulgationSerializer();

    const outBuffer = await serializer.serialize(table);
    const outputFileWithExt =
      path.extname(outputFile) === "" ? outputFile + ".xlsx" : outputFile;

    fs.writeFile(path.resolve(outputFileWithExt), outBuffer);
  }
}
