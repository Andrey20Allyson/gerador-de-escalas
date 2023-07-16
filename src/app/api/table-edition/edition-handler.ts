import { ExtraDutyTable, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { ParseTablePayload, parseExtraTable } from "../utils/table";
import { TableEditor, TableEditorData } from "./table-editor";
import { ErrorCode } from "../app.base";

export interface EditionHandlerData {
  table: ExtraDutyTable;
  workers: WorkerInfo[];
}

export class EditionHandler {
  constructor(public data?: EditionHandlerData) { }

  load(payload: ParseTablePayload) {
    const { table, workers } = parseExtraTable(payload);

    this.data = { table, workers };
  }

  createEditor() {
    const { data } = this;
    if (!data) return ErrorCode.DATA_NOT_LOADED;

    return TableEditor.load(data.table);
  }

  save(data: TableEditorData) {
    const { data: thisData } = this;
    if (!thisData) return ErrorCode.DATA_NOT_LOADED;

    const { table, workers } = thisData;
    const workerMap = WorkerInfo.createMap(workers);

    const editor = new TableEditor(data);

    editor.save(table, workerMap);
  }
}