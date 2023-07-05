import { io } from "@andrey-allyson/escalas-automaticas";
import { parseTable } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/io";
import { ExtraDutyTableV2, Holidays, WorkerInfo, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { BookHandler, SheetHandler } from "@andrey-allyson/escalas-automaticas/dist/xlsx-handlers";

export interface InputTable {
  buffer: Buffer;
  sheetName: string;
}

export interface EditorInput {
  ordinaryTable: InputTable;
  tableToEdit: InputTable;
}

export interface TableEditorLoadedData {
  table: ExtraDutyTableV2;
  workers: WorkerInfo[];
}

export interface InputMonth {
  month: number;
  year: number;
}

export class TableEditor {
  loadedData: TableEditorLoadedData | null = null;

  constructor(
    readonly workerRegistryMap: WorkerRegistriesMap,
    readonly holidays: Holidays,
  ) { }

  load(payload: EditorInput) {
    const {
      ordinaryTable,
      tableToEdit,
    } = payload;

    const sheet = BookHandler
      .parse(tableToEdit.buffer)
      .getSheet(tableToEdit.sheetName);

    const { year, month } = TableEditor.extractYearAndMonthFromBook(sheet);

    const { holidays, workerRegistryMap } = this;

    const workers = io.parseWorkers(ordinaryTable.buffer, {
      sheetName: ordinaryTable.sheetName,
      workerRegistryMap,
      holidays,
      month,
      year,
    });

    const table = parseTable(tableToEdit.buffer, workers, {
      sheetName: tableToEdit.sheetName,
    });

    this.loadedData = {
      workers,
      table,
    };
  }

  private static extractYearAndMonthFromBook(sheet: SheetHandler): InputMonth {
    return {
      month: sheet.at('c', 7).as('number').value,
      year: sheet.at('c', 6).as('number').value,
    } 
  }
}