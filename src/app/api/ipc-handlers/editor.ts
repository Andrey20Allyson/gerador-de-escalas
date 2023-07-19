import { ExtraDutyTable, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import fs from 'fs/promises';
import { AppEditorHandler, HandlerFactory } from ".";
import { AppError, AppResponse, AppResponseType, ErrorCode } from "../app.base";
import { AppAssets } from "../assets";
import { TableEditor, TableEditorData } from "../table-edition";
import { ReadTablePayload, parseExtraTable, readTables } from "../utils/table";

export interface EditorHandlerFactoryData {
  table: ExtraDutyTable;
  workers: WorkerInfo[];
}

export class EditorHandlerFactory implements HandlerFactory<AppEditorHandler> {
  constructor(
    readonly assets: AppAssets,
    public data?: EditorHandlerFactoryData
  ) { }

  clear() {
    delete this.data;
  }

  async load(payload: ReadTablePayload): Promise<AppResponseType<void, ErrorCode.INVALID_INPUT>> {
    try {
      const tables = await readTables(payload, fs);
      const { holidays, workerRegistryMap } = this.assets;

      const { table, workers } = parseExtraTable({ holidays, tables, workerRegistryMap });

      this.data = { table, workers };

      return AppResponse.ok();
    } catch (error) {
      const appError = AppError.parse(error);

      return AppResponse.error(appError.message, ErrorCode.INVALID_INPUT, appError.callstack);
    }
  }

  createEditor(): AppResponseType<TableEditorData, ErrorCode.DATA_NOT_LOADED> {
    const { data } = this;
    if (!data) return AppResponse.error('Shold load data before get editor!', ErrorCode.DATA_NOT_LOADED);

    const { table, workers } = data;

    const editor = TableEditor.from(table, workers);

    return AppResponse.ok(editor.data);
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

  async serialize(): Promise<AppResponseType<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    const table = this.data?.table;
    if (!table) return AppResponse.error('Shold load data before serialize!', ErrorCode.DATA_NOT_LOADED);

    const { serializer } = this.assets;

    const buffer = await serializer.generate(table, { sheetName: 'DADOS' });

    return AppResponse.ok(buffer.buffer);
  }

  hander(): AppEditorHandler {
    const handler = this;

    return {
      load: async (_, payload) => handler.load(payload),
      getEditor: async () => handler.createEditor(),
      save: async (_, data) => handler.save(data),
      serialize: () => handler.serialize(), 
      clear: async () => handler.clear(),
    };
  }
}