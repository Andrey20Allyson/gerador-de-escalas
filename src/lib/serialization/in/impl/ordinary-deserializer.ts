import {
  WorkerRegistryMap,
  WorkerRegistryRepository,
} from "src/lib/persistence/entities/worker-registry";
import { ExtraDutyTable, Month, WorkerInfo } from "src/lib/structs";
import { WorkerInfoParser } from "src/lib/structs/worker-info/parser";
import { Result, ResultError, ResultType } from "src/utils";
import { BookHandler, CellHandler, LineHander } from "src/utils/xlsx-handlers";
import * as XLSX from "xlsx";
import { Deserializer } from "../deserializer";
import { ScheduleMetadataReader } from "../metadata/reader";

interface OrdinaryDeserializerConfig {
  readonly sheetName?: string;
  readonly month: Month;
  readonly workerRegistryRepository: WorkerRegistryRepository;
}

export class OrdinaryDeserializer implements Deserializer {
  constructor(readonly config: OrdinaryDeserializerConfig) {}

  async deserialize(buffer: Buffer): Promise<ExtraDutyTable> {
    const workBook = XLSX.read(buffer);

    const { month, workerRegistryRepository, sheetName } = this.config;

    const table = new ExtraDutyTable({ month });

    const workerRegistries = await workerRegistryRepository.load();

    const workers = scrappeWorkersFromBook(workBook, {
      sheetName,
      month,
      workerRegistries,
    });

    table.addWorkers(workers);

    return table;
  }
}

export enum WorkerInfoCollumns {
  NAME = "d",
  HOURLY = "f",
  GRAD = "b",
  POST = "e",
  REGISTRATION = "c",
  LIMIT = "g",
}

export const workersTableCollumns = LineHander.collumnTuple([
  WorkerInfoCollumns.NAME,
  WorkerInfoCollumns.HOURLY,
  WorkerInfoCollumns.GRAD,
  WorkerInfoCollumns.POST,
  WorkerInfoCollumns.REGISTRATION,
  WorkerInfoCollumns.LIMIT,
]);

export const workersTableCellTypes = CellHandler.typeTuple([
  "string",
  "string",
  "string",
  "string?",
  "string",
  "string?",
]);

export function scrappeWorkersFromBook(
  book: XLSX.WorkBook,
  options: ScrappeWorkersOptions,
) {
  return Result.unwrap(safeScrappeWorkersFromBook(book, options));
}

export interface ScrappeWorkersOptions {
  month: Month;
  sheetName?: string;
  workerRegistries?: WorkerRegistryMap;
}

function safeScrappeWorkersFromBook(
  workBook: XLSX.WorkBook,
  options: ScrappeWorkersOptions,
): ResultType<WorkerInfo[]> {
  const book = new BookHandler(workBook);

  const sheet = book.safeGetSheet(options.sheetName);
  if (ResultError.isError(sheet)) return sheet;

  const workerInfos: WorkerInfo[] = [];
  const parser = new WorkerInfoParser();

  const { workerRegistries } = options;

  const errors: ResultError[] = [];

  for (const line of sheet.iterLines(2)) {
    if (line.at("a").is("empity")) {
      continue;
    }

    const cellsResult = line.safeGetCells(workersTableCollumns);

    if (ResultError.isError(cellsResult)) {
      errors.push(cellsResult);
      continue;
    }

    const typedCellsResult = CellHandler.safeTypeAll(
      cellsResult,
      workersTableCellTypes,
    );

    if (ResultError.isError(typedCellsResult)) {
      errors.push(typedCellsResult);
      continue;
    }

    const [
      nameCell,
      hourlyCell,
      gradCell,
      postCell,
      registrationCell,
      workLimitCell,
    ] = typedCellsResult;

    const workerRegistry = workerRegistries?.get(registrationCell.value);
    if (workerRegistries != null && workerRegistry == null) {
      const id = registrationCell.value;
      const name = nameCell.value;

      const error = new ResultError(
        `Can't find the registry of worker with id "${id}"${name !== undefined ? ` and name "${name}"` : ""}.`,
      );

      errors.push(error);
      continue;
    }

    try {
      const worker = parser.parse({
        name: nameCell.value,
        hourly: hourlyCell.value,
        workerId: registrationCell.value,
        workLimit: workLimitCell.value,
        individualId: workerRegistry?.individualId,
        gender: workerRegistry?.gender,
        grad: gradCell.value,
        post: postCell.value ?? "",
        month: options.month,
      });

      if (!worker) continue;

      worker.addRules(workerRegistry?.rules);

      workerInfos.push(worker);
    } catch (e) {
      errors.push(ResultError.create(e));

      continue;
    }
  }

  if (errors.length > 0) {
    const message = errors
      .map((error) => `\n - ${error.name}: ${error.message}`)
      .join("");

    return ResultError.create(message);
  }

  return workerInfos;
}
