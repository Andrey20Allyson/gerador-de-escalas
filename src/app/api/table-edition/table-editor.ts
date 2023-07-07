import { io } from "@andrey-allyson/escalas-automaticas";
import { parseTable } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/io";
import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { ExtraDutyTableV2, Holidays, WorkerInfo, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { BookHandler, SheetHandler } from "@andrey-allyson/escalas-automaticas/dist/xlsx-handlers";
import { EditableDutyTable, TableSlotMap } from "./editable-table";

export interface InputTable {
  buffer: Buffer;
  sheetName: string;
}

export interface EditorInput {
  ordinaryTable: InputTable;
  tableToEdit: InputTable;
}

export interface TableEditorLoadedData {
  outputSheetName: string;
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
    readonly serializer: MainTableFactory,
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
      outputSheetName: tableToEdit.sheetName,
      workers,
      table,
    };
  }

  getLoadedData() {
    const data = this.loadedData;
    if (!data) throw new Error(`Data hasn't loaded yet`);

    return data;
  }

  createEditable() {
    const data = this.getLoadedData();

    return EditableDutyTable.load(data);
  }

  save(changes: TableSlotMap) {
    const data = this.getLoadedData();

    EditableDutyTable.applyChanges(changes, data.table, new Map(data.workers.map(mapWorkerFromName)));
  }

  async createSerializerCache() {
    return this.serializer.createCache();
  }

  async serialize() {
    const data = this.getLoadedData();

    return this.serializer.generate(data.table, {
      sheetName: data.outputSheetName,
    });
  }

  private static extractYearAndMonthFromBook(sheet: SheetHandler): InputMonth {
    return {
      month: sheet.at('c', 7).as('number').value,
      year: sheet.at('c', 6).as('number').value,
    }
  }
}

function mapWorkerFromName(worker: WorkerInfo): [string, WorkerInfo] {
  return [worker.name, worker];
}