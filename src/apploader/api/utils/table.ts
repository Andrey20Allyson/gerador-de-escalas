import { io } from "../../auto-schedule";
import { WorkerRegistry, WorkerRegistryMap } from "../../auto-schedule/persistence/entities/worker-registry";
import { Holidays } from "../../auto-schedule/extra-duty-lib";
import { BookHandler, SheetHandler } from "../../auto-schedule/xlsx-handlers";
import fs from 'fs/promises';

export interface InputTable {
  buffer: Buffer;
  sheetName: string;
}

export interface ParseTablePayload {
  workerRegistryMap?: WorkerRegistryMap,
  table: InputTable;
}

export interface ParseOrdinaryPayload {
  workerRegistryMap: WorkerRegistryMap;
  holidays: Holidays;
  table: InputTable;
  month: number;
  year: number;
}

export function parseOrdinary(payload: ParseOrdinaryPayload) {
  const { holidays, month, table, workerRegistryMap, year } = payload;
  const { buffer, sheetName } = table;

  return io.parseWorkers(buffer, {
    workerRegistries: workerRegistryMap,
    sheetName,
    holidays,
    month,
    year,
  });
}

export interface ReadTableConfig {
  sheetName: string,
  filePath: string
}

export interface ReadTablePayload {
  table: ReadTableConfig;
}

export interface FileSystemLike extends Pick<typeof fs, 'readFile'> { }

export async function readTables(payload: ReadTablePayload, fs: FileSystemLike): Promise<InputTable> {
  const { table } = payload;
  
  return {
    buffer: await fs.readFile(table.filePath),
    sheetName: table.sheetName,
  };
}

export function parseExtraTable(payload: ParseTablePayload) {
  const { workerRegistryMap, table: excelTable } = payload;

  const sheet = BookHandler
    .parse(excelTable.buffer)
    .getSheet(excelTable.sheetName);

  const { year, month } = extractYearAndMonthFromBook(sheet);

  const workers = io.parseWorkers(ordinaryTable.buffer, {
    sheetName: ordinaryTable.sheetName,
    workerRegistries: workerRegistryMap,
    month,
    year,
  });

  const table = io.parseTable(tableToEdit.buffer, workers, {
    sheetName: tableToEdit.sheetName,
  });

  return { table, workers };
}

export interface InputMonth {
  month: number;
  year: number;
}

export function extractYearAndMonthFromBook(sheet: SheetHandler): InputMonth {
  return {
    month: sheet.at('c', 7).as('number').value - 1,
    year: sheet.at('c', 6).as('number').value,
  }
}