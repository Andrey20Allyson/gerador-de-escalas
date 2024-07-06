import { io } from "../../auto-schedule";
import { WorkerRegistry } from "../../auto-schedule/registries/worker-registry";
import { Holidays, WorkerRegistryMap } from "../../auto-schedule/extra-duty-lib";
import { BookHandler, SheetHandler } from "../../auto-schedule/xlsx-handlers";
import fs from 'fs/promises';

export interface InputTable {
  buffer: Buffer;
  sheetName: string;
}

export interface LoadTableInput {
  ordinaryTable: InputTable;
  extraDutyTable: InputTable;
}

export interface ParseTablePayload {
  workerRegistryMap: WorkerRegistryMap,
  tables: LoadTableInput;
  holidays: Holidays;
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
  ordinaryTable: ReadTableConfig;
  extraDutyTable: ReadTableConfig;
}

export interface FileSystemLike extends Pick<typeof fs, 'readFile'> { }

export async function readTables(payload: ReadTablePayload, fs: FileSystemLike): Promise<LoadTableInput> {
  const { extraDutyTable, ordinaryTable } = payload;
  
  return {
    extraDutyTable: {
      buffer: await fs.readFile(extraDutyTable.filePath),
      sheetName: extraDutyTable.sheetName,
    },
    ordinaryTable: {
      buffer: await fs.readFile(ordinaryTable.filePath),
      sheetName: ordinaryTable.sheetName,
    },
  };
}

export function parseExtraTable(payload: ParseTablePayload) {
  const { holidays, workerRegistryMap, tables } = payload;
  const { ordinaryTable, extraDutyTable: tableToEdit } = tables;

  const sheet = BookHandler
    .parse(tableToEdit.buffer)
    .getSheet(tableToEdit.sheetName);

  const { year, month } = extractYearAndMonthFromBook(sheet);

  const workers = io.parseWorkers(ordinaryTable.buffer, {
    sheetName: ordinaryTable.sheetName,
    workerRegistries: workerRegistryMap,
    holidays,
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