import { ExtraDutyTable, WorkerInfo } from "src/lib/structs";
import fs from "fs/promises";
import { AppAssets } from "../assets";
import { TableData, TableFactory } from "../table-reactive-edition/table";
import { ReadTablePayload, parseExtraTable, readTables } from "../utils/table";
import { ErrorCode, AppError } from "../mapping/error";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import {
  DivulgationSerializer,
  PaymentSerializationStratergy,
  Serializer,
} from "src/lib/serialization";

export interface EditorHandlerFactoryData {
  table: ExtraDutyTable;
  workers: WorkerInfo[];
}

export type SerializationMode = "payment" | "divugation" | "day-list";

export class EditorHandler implements IpcMappingFactory {
  readonly tableFactory = new TableFactory();

  constructor(
    readonly assets: AppAssets,
    public data?: EditorHandlerFactoryData,
  ) {}

  clear() {
    delete this.data;
  }

  async load(
    _: IpcMapping.IpcEvent,
    payload: ReadTablePayload,
  ): Promise<AppResponse<void, ErrorCode.INVALID_INPUT>> {
    try {
      const tables = await readTables(payload, fs);
      const { workerRegistryMap } = this.assets;

      const { table, workers } = parseExtraTable({ tables, workerRegistryMap });

      this.data = { table, workers };

      return AppResponse.ok();
    } catch (error) {
      const appError = AppError.parse(error);

      return AppResponse.error(
        appError.message,
        ErrorCode.INVALID_INPUT,
        appError.callstack,
      );
    }
  }

  createEditor(): AppResponse<TableData, ErrorCode.DATA_NOT_LOADED> {
    const { data } = this;
    if (!data)
      return AppResponse.error(
        "Shold load data before get editor!",
        ErrorCode.DATA_NOT_LOADED,
      );

    const { table, workers } = data;

    const tableDTO = this.tableFactory.toDTO(table, workers);

    return AppResponse.ok(tableDTO);
  }

  save(
    _: IpcMapping.IpcEvent,
    data: TableData,
  ): AppResponse<void, ErrorCode.DATA_NOT_LOADED> {
    const { data: thisData } = this;
    if (!thisData)
      return AppResponse.error(
        "Shold load data before save!",
        ErrorCode.DATA_NOT_LOADED,
      );

    const { table, workers } = thisData;

    this.tableFactory.fromDTO(data, table, workers);

    return AppResponse.ok();
  }

  getSerializationStratergy(mode: SerializationMode): Serializer {
    switch (mode) {
      case "payment":
        return new PaymentSerializationStratergy(
          this.assets.paymentPatternBuffer,
          "DADOS",
        );
      case "divugation":
        return new DivulgationSerializer("DADOS");
      case "day-list":
        throw new Error(`Serialization mode '${mode}' not mapped!`);
      default:
        throw new Error(`Serialization mode '${mode}' not mapped!`);
    }
  }

  async serialize(
    _: IpcMapping.IpcEvent,
    mode: SerializationMode,
  ): Promise<AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    const table = this.data?.table;
    if (!table)
      return AppResponse.error(
        "Shold load data before serialize!",
        ErrorCode.DATA_NOT_LOADED,
      );

    const serializer = this.getSerializationStratergy(mode);

    const buffer = await serializer.serialize(table);

    return AppResponse.ok(buffer.buffer);
  }

  handler() {
    return IpcMapping.create(
      {
        createEditor: this.createEditor,
        serialize: this.serialize,
        clear: this.clear,
        load: this.load,
        save: this.save,
      },
      this,
    );
  }
}
