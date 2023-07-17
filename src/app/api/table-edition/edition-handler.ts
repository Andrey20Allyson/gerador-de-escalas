import { ExtraDutyTable, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { ParseTablePayload, parseExtraTable } from "../utils/table";
import { TableEditor, TableEditorData } from "./table-editor";
import { AppResponse, AppResponseType, ErrorCode } from "../app.base";

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

    return TableEditor.from(data.table);
  }

  save(data: TableEditorData): AppResponseType<void, ErrorCode.DATA_NOT_LOADED> {
    const { data: thisData } = this;
    if (!thisData) return AppResponse.error('Shold load data before save!', ErrorCode.DATA_NOT_LOADED);

    const { table, workers } = thisData;
    const workerMap = WorkerInfo.createMap(workers);

    const editor = new TableEditor(data);

    editor.save(table, workerMap);

    return AppResponse.ok();
  }
}