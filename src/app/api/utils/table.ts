import { io } from "@andrey-allyson/escalas-automaticas";
import { Holidays, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { BookHandler, SheetHandler } from "@andrey-allyson/escalas-automaticas/dist/xlsx-handlers";

export interface InputTable {
  buffer: Buffer;
  sheetName: string;
}

export interface LoadTableInput {
  ordinaryTable: InputTable;
  extraDutyTable: InputTable;
}

export interface ParseTablePayload {
  workerRegistryMap: WorkerRegistriesMap,
  tables: LoadTableInput;
  holidays: Holidays;
}

export function parseTable(payload: ParseTablePayload) {
  const { holidays, workerRegistryMap, tables } = payload;
  const { ordinaryTable, extraDutyTable: tableToEdit } = tables;

  const sheet = BookHandler
    .parse(tableToEdit.buffer)
    .getSheet(tableToEdit.sheetName);

  const { year, month } = extractYearAndMonthFromBook(sheet);

  const workers = io.parseWorkers(ordinaryTable.buffer, {
    sheetName: ordinaryTable.sheetName,
    workerRegistryMap,
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
    month: sheet.at('c', 7).as('number').value,
    year: sheet.at('c', 6).as('number').value,
  }
}