import { DivugationTableFactory, TableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { DayListTableFactory } from '@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories/day-list-factory';
import { ExtraDutyTable, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import fs from 'fs/promises';
import { AppAssets } from "../assets";
import { IpcMapping, IpcMappingFactory } from "../mapping";
import { TableEditor, TableEditorData } from "../table-edition";
import { ReadTablePayload, parseExtraTable, readTables } from "../utils/table";
import { AppResponse, ErrorCode, AppError } from "../../base";

export interface EditorHandlerFactoryData {
  table: ExtraDutyTable;
  workers: WorkerInfo[];
}

export type SerializationMode = 'payment' | 'divugation' | 'day-list';

export class EditorHandler implements IpcMappingFactory {
  constructor(
    readonly assets: AppAssets,
    public data?: EditorHandlerFactoryData
  ) { }

  clear() {
    delete this.data;
  }

  async load(_: IpcMapping.IpcEvent, payload: ReadTablePayload): Promise<AppResponse<void, ErrorCode.INVALID_INPUT>> {
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

  createEditor(): AppResponse<TableEditorData, ErrorCode.DATA_NOT_LOADED> {
    const { data } = this;
    if (!data) return AppResponse.error('Shold load data before get editor!', ErrorCode.DATA_NOT_LOADED);

    const { table, workers } = data;

    const editor = TableEditor.from(table, workers);

    return AppResponse.ok(editor.data);
  }

  save(_: IpcMapping.IpcEvent, data: TableEditorData): AppResponse<void, ErrorCode.DATA_NOT_LOADED> {
    const { data: thisData } = this;
    if (!thisData) return AppResponse.error('Shold load data before save!', ErrorCode.DATA_NOT_LOADED);

    const { table, workers } = thisData;
    const workerMap = WorkerInfo.createMap(workers);

    const editor = new TableEditor(data);

    editor.save(table, workerMap);

    return AppResponse.ok();
  }

  getSerializer(mode: SerializationMode): TableFactory {
    switch (mode) {
      case 'payment':
        return this.assets.serializer;
      case 'divugation':
        return new DivugationTableFactory();
      case 'day-list':
        return new DayListTableFactory();
      default:
        throw new Error(`Serialization mode '${mode}' not mapped!`);
    }
  }

  async serialize(_: IpcMapping.IpcEvent, mode: SerializationMode): Promise<AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    const table = this.data?.table;
    if (!table) return AppResponse.error('Shold load data before serialize!', ErrorCode.DATA_NOT_LOADED);

    const serializer = this.getSerializer(mode);

    const buffer = await serializer.generate(table, { sheetName: 'DADOS' });

    return AppResponse.ok(buffer.buffer);
  }

  handler() {
    return IpcMapping.create({
      createEditor: this.createEditor,
      serialize: this.serialize,
      clear: this.clear,
      load: this.load,
      save: this.save,
    }, this);
  }
}