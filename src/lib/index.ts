// import { ExtraDutyTable, Holidays, Month, WorkerInfo } from "src/lib/structs";
// import { JQScheduleBuilder } from "./builders/jq-schedule-builder";
// import {
//   parseTable,
//   parseWorkers,
//   ScrappeTableOptions,
//   serializeTable,
// } from "./io";
// import { WorkerRegistryMap } from "./persistence/entities/worker-registry";
// import { getMonth, getYear } from "../utils";
// import { analyseResult } from "../utils/analyser";
// import { Benchmarker } from "../utils/benchmark";
// import { MainTableFactory } from "src/utils/xlsx-builders/main-factory";

// export interface GenerateOptions extends GenerateFromWorkersOptions {
//   holidays?: Holidays;
//   inputSheetName?: string;
//   workerRegistries?: WorkerRegistryMap;
// }

// export function generate(
//   data: Buffer,
//   options: GenerateOptions = {},
// ): Promise<Buffer> {
//   const month = options.month ?? Month.now();

//   const workersParseProcess = options.benchmarker?.start("parse workers");
//   const workers = parseWorkers(data, {
//     workerRegistries: options.workerRegistries,
//     sheetName: options.inputSheetName,
//     holidays: options.holidays,
//     month,
//   });
//   workersParseProcess?.end();

//   return generateFromWorkers(workers, options);
// }

// export interface GenerateFromWorkersOptions extends GenerateFromTableOptions {
//   month?: Month;
//   tries?: number;

//   onAnalyse?: (message: string) => void;
// }

// export function generateFromWorkers(
//   workers: WorkerInfo[],
//   options: GenerateFromWorkersOptions = {},
// ): Promise<Buffer> {
//   const assignArrayProcess = options.benchmarker?.start(
//     "assign workers to table",
//   );

//   const table = new ExtraDutyTable({
//     month: options.month,
//   });

//   new JQScheduleBuilder(options.tries ?? 7000).build(table, workers);

//   assignArrayProcess?.end();

//   if (options.onAnalyse) {
//     const analysisResult = analyseResult(table);
//     options.onAnalyse(analysisResult);
//   }

//   return generateFromTable(table, options);
// }

// export interface GenerateFromTableOptions {
//   patternBuffer?: Buffer;
//   sortByName?: boolean;
//   benchmarker?: Benchmarker;
//   outputSheetName?: string;
// }

// export async function generateFromTable(
//   table: ExtraDutyTable,
//   options: GenerateFromTableOptions = {},
// ): Promise<Buffer> {
//   const serializeTableProcess = options.benchmarker?.start("serialize table");
//   const serializationPattern =
//     options.patternBuffer && new MainTableFactory(options.patternBuffer);
//   const serializedTable = await serializeTable(table, {
//     sheetName: options.outputSheetName ?? "Main",
//     pattern: serializationPattern,
//   });
//   serializeTableProcess?.end();

//   return serializedTable;
// }

// export function tableFrom(
//   buffer: Buffer,
//   workers: WorkerInfo[],
//   options: ScrappeTableOptions,
// ): ExtraDutyTable {
//   return parseTable(buffer, workers, options);
// }
