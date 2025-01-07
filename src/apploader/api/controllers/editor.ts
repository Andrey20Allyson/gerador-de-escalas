import { ExtraDutyTable, Month } from "src/lib/structs";
import fs from "node:fs/promises";
import { AppAssets } from "../assets";
import { TableData, TableFactory } from "../table-reactive-edition/table";
import {
  ErrorCode,
  AppError,
  DeserializationErrorCode,
} from "../mapping/error";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import {
  DivulgationSerializer,
  PaymentSerializationStratergy,
  Serializer,
  XLSXMetadataDeserializer,
} from "src/lib/serialization";
import { WorkerRegistryRepository } from "src/lib/persistence/entities";
import { OrdinaryDeserializer } from "src/lib/serialization/in/impl/ordinary-deserializer";
import { MetadataNotFoundError } from "src/lib/serialization/in/metadata/reader";

export interface EditorHandlerFactoryData {
  table: ExtraDutyTable;
}

export type SerializationMode = "payment" | "divugation" | "day-list";

export interface LoadOrdinaryPayload {
  path: string;
  month: number;
  year: number;
}

export class EditorHandler implements IpcMappingFactory {
  readonly tableFactory = new TableFactory();

  constructor(
    readonly assets: AppAssets,
    public data?: EditorHandlerFactoryData,
  ) {}

  getWorkerRegistryRepository(): WorkerRegistryRepository {
    return this.assets.services.workerRegistry.repository;
  }

  clear() {
    delete this.data;
  }

  async load(
    _: IpcMapping.IpcEvent,
    path: string,
  ): Promise<
    AppResponse<
      void,
      ErrorCode.INVALID_INPUT | DeserializationErrorCode.INEXISTENT_METADATA
    >
  > {
    try {
      const buffer = await fs.readFile(path);

      const deserializer = new XLSXMetadataDeserializer();

      const table = await deserializer.deserialize(buffer);

      this.data = { table };

      return AppResponse.ok();
    } catch (error) {
      if (error instanceof MetadataNotFoundError) {
        return AppResponse.error(
          error.message,
          DeserializationErrorCode.INEXISTENT_METADATA,
          error.stack,
        );
      }

      const appError = AppError.parse(error);

      return AppResponse.error(
        appError.message,
        ErrorCode.INVALID_INPUT,
        appError.callstack,
      );
    }
  }

  async loadOrdinary(
    _: IpcMapping.IpcEvent,
    payload: LoadOrdinaryPayload,
  ): Promise<AppResponse<void, ErrorCode.UNKNOW>> {
    const buffer = await fs.readFile(payload.path);

    const deserializer = new OrdinaryDeserializer({
      month: new Month(payload.year, payload.month),
      workerRegistryRepository: this.getWorkerRegistryRepository(),
    });

    const table = await deserializer.deserialize(buffer);

    this.data = { table };

    return AppResponse.ok();
  }

  createEditor(): AppResponse<TableData, ErrorCode.DATA_NOT_LOADED> {
    const { data } = this;
    if (!data)
      return AppResponse.error(
        "Shold load data before get editor!",
        ErrorCode.DATA_NOT_LOADED,
      );

    const { table } = data;

    const tableDTO = this.tableFactory.toDTO(table);

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

    const { table } = thisData;

    this.tableFactory.fromDTO(data, table);

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
        loadOrdinary: this.loadOrdinary,
        serialize: this.serialize,
        clear: this.clear,
        load: this.load,
        save: this.save,
      },
      this,
    );
  }
}
