import { ExtraDutyTable, Month } from "src/lib/structs";
import fs from "node:fs/promises";
import { AppAssets } from "../assets";
import {
  ScheduleFileSaveConfig,
  ScheduleState,
  TableFactory,
} from "../table-reactive-edition/table";
import {
  ErrorCode,
  AppError,
  DeserializationErrorCode,
} from "../mapping/error";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import {
  DivulgationSerializer,
  PaymentSerializer,
  Serializer,
  XLSXMetadataDeserializer,
} from "src/lib/serialization";
import { WorkerRegistryRepository } from "src/lib/persistence/entities";
import { OrdinaryDeserializer } from "src/lib/serialization/in/impl/ordinary-deserializer";
import { MetadataNotFoundError } from "src/lib/serialization/in/metadata/reader";
import { NativeScheduleBuilder } from "src/lib/builders/native-schedule-builder";

export interface EditorHandlerFactoryData {
  table: ExtraDutyTable;
}

export type SerializationMode = "payment" | "divugation" | "day-list";
export type ScheduleType = "ordinary" | SerializationMode;

export interface LoadOrdinaryPayload {
  path: string;
  month: number;
  year: number;
  sheetName?: string;
}

export class EditorHandler implements IpcMappingFactory {
  readonly tableFactory = new TableFactory();

  constructor(readonly assets: AppAssets) {}

  getWorkerRegistryRepository(): WorkerRegistryRepository {
    return this.assets.services.workerRegistry.repository;
  }

  async load(
    _: IpcMapping.IpcEvent,
    path: string,
  ): Promise<
    AppResponse<
      ScheduleState,
      ErrorCode.INVALID_INPUT | DeserializationErrorCode.INEXISTENT_METADATA
    >
  > {
    try {
      const buffer = await fs.readFile(path);

      const deserializer = new XLSXMetadataDeserializer();

      const { schedule, fileInfo } = await deserializer.deserialize(buffer);

      const fileSaveConfig: ScheduleFileSaveConfig = {
        path,
        fileInfo,
      };

      const state = this.tableFactory.intoState(schedule, fileSaveConfig);

      return AppResponse.ok(state);
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
  ): Promise<AppResponse<ScheduleState, ErrorCode.UNKNOW>> {
    const buffer = await fs.readFile(payload.path);

    const deserializer = new OrdinaryDeserializer({
      month: new Month(payload.year, payload.month),
      sheetName: payload.sheetName,
      workerRegistryRepository: this.getWorkerRegistryRepository(),
    });

    const { schedule, fileInfo } = await deserializer.deserialize(buffer);

    const fileSaveConfig: ScheduleFileSaveConfig = {
      path: payload.path,
      fileInfo,
    };

    const state = this.tableFactory.intoState(schedule, fileSaveConfig);

    return AppResponse.ok(state);
  }

  generate(
    _: IpcMapping.IpcEvent,
    state: ScheduleState,
  ): AppResponse<ScheduleState, ErrorCode.DATA_NOT_LOADED> {
    const table = this.tableFactory.fromState(state);

    table.clear();

    const builder = new NativeScheduleBuilder({ tries: 10_000 });
    builder.build(table);

    const newState = this.tableFactory.intoState(table, state.fileSaveConfig);

    return AppResponse.ok(newState);
  }

  getSerializationStratergy(mode: SerializationMode): Serializer {
    switch (mode) {
      case "payment":
        return new PaymentSerializer(this.assets.paymentPatternBuffer, "DADOS");
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
    state: ScheduleState,
    mode: SerializationMode,
  ): Promise<AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    const table = this.tableFactory.fromState(state);

    const serializer = this.getSerializationStratergy(mode);

    const buffer = await serializer.serialize(table);

    return AppResponse.ok(buffer.buffer);
  }

  handler() {
    return IpcMapping.create(
      {
        load: this.load,
        loadOrdinary: this.loadOrdinary,
        generate: this.generate,
        serialize: this.serialize,
      },
      this,
    );
  }
}
