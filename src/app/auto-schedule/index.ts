import { ExtraDutyTable, Holidays, WorkerInfo, WorkerRegistryMap } from './extra-duty-lib';
import { JQScheduleBuilder } from './extra-duty-lib/builders/jq-schedule-builder';
import { getMonth, getYear } from './utils';
import { analyseResult } from './utils/analyser';
import { Benchmarker } from './utils/benchmark';
import { parseTable, parseWorkers, serializeTable, ScrappeTableOptions } from './io';
import { WorkerRegistry } from './registries/worker-registry';
import { MainTableFactory } from './xlsx-builders/main-factory';

export interface GenerateOptions extends GenerateFromWorkersOptions {
  holidays?: Holidays;
  inputSheetName?: string;
  workerRegistries?: WorkerRegistryMap;
}

export function generate(data: Buffer, options: GenerateOptions = {}): Promise<Buffer> {
  const month = options.month ?? getMonth();
  const year = options.year ?? getYear();

  const workersParseProcess = options.benchmarker?.start('parse workers');
  const workers = parseWorkers(data, {
    workerRegistries: options.workerRegistries,
    sheetName: options.inputSheetName,
    holidays: options.holidays,
    month,
    year,
  });
  workersParseProcess?.end();

  return generateFromWorkers(workers, options);
}

export interface GenerateFromWorkersOptions extends GenerateFromTableOptions {
  month?: number;
  tries?: number;
  year?: number;

  onAnalyse?: (message: string) => void;
}

export function generateFromWorkers(workers: WorkerInfo[], options: GenerateFromWorkersOptions = {}): Promise<Buffer> {
  const month = options.month ?? getMonth();
  const year = options.year ?? getYear();

  const assignArrayProcess = options.benchmarker?.start('assign workers to table');
  const table = new ExtraDutyTable({ month, year });
  
  new JQScheduleBuilder(options.tries ?? 7000)
    .build(table, workers);
  
    assignArrayProcess?.end();

  if (options.onAnalyse) {
    const analysisResult = analyseResult(table);
    options.onAnalyse(analysisResult);
  }

  return generateFromTable(table, options);
}

export interface GenerateFromTableOptions {
  patternBuffer?: Buffer;
  sortByName?: boolean;
  benchmarker?: Benchmarker;
  outputSheetName?: string;
}

export async function generateFromTable(table: ExtraDutyTable, options: GenerateFromTableOptions = {}): Promise<Buffer> {
  const serializeTableProcess = options.benchmarker?.start('serialize table');
  const serializationPattern = options.patternBuffer && new MainTableFactory(options.patternBuffer);
  const serializedTable = await serializeTable(table, {
    sheetName: options.outputSheetName ?? 'Main',
    pattern: serializationPattern,
  });
  serializeTableProcess?.end();

  return serializedTable;
}

export function tableFrom(buffer: Buffer, workers: WorkerInfo[], options: ScrappeTableOptions): ExtraDutyTable {
  return parseTable(buffer, workers, options);
}

export * as io from './io';
export * as serializers from './xlsx-builders';
export * as lib from './extra-duty-lib';
export * as excelHandles from './xlsx-handlers';
export * as utils from './utils';