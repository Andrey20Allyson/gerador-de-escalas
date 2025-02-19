import { ExtraDutyTable, Month } from "src/lib/structs";
import fs from "node:fs/promises";
import { AppAssets } from "../assets";
import {
  ScheduleFileSaveConfig,
  ScheduleState,
  TableFactory,
} from "../table-reactive-edition";
import {
  ErrorCode,
  AppError,
  DeserializationErrorCode,
  ScheduleSaveErrorCode,
} from "../mapping/error";
import { AppResponse } from "../mapping/response";
import { IpcMappingFactory, IpcMapping } from "../mapping/utils";
import {
  DivulgationSerializer,
  JsonSerializer,
  PaymentSerializer,
  ScheduleFileType,
  Serializer,
  XLSXMetadataDeserializer,
} from "src/lib/serialization";
import { WorkerRegistryRepository } from "src/lib/persistence/entities";
import { OrdinaryDeserializer } from "src/lib/serialization/in/impl/ordinary-deserializer";
import { MetadataNotFoundError } from "src/lib/serialization/in/metadata/reader";
import { NativeScheduleBuilder } from "src/lib/builders/native-schedule-builder";
import { OrdinarySerializer } from "src/lib/serialization/out/stratergies/ordinary-serializer";
import { dialog } from "electron";

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

  getSerializer(fileSaveConfig: ScheduleFileSaveConfig): Serializer {
    const { path, fileInfo } = fileSaveConfig;

    switch (fileInfo.type) {
      case "ordinary":
        return new OrdinarySerializer(path);
      case "payment":
        return new PaymentSerializer(this.assets.paymentPatternBuffer, "DADOS");
      case "divulgation":
        return new DivulgationSerializer("DADOS");
      case "json":
        return new JsonSerializer();
      default:
        throw new Error(`Serialization for '${fileInfo.type}' isn't mapped!`);
    }
  }

  async saveAs(
    _: IpcMapping.IpcEvent,
    state: ScheduleState,
    fileType: ScheduleFileType,
  ): Promise<
    AppResponse<
      ScheduleFileSaveConfig,
      ScheduleSaveErrorCode.SAVE_CANCELED | ErrorCode.UNKNOW
    >
  > {
    const { canceled, filePath: path } = await dialog.showSaveDialog(
      this.assets.mainWindow,
      {
        title: "Salvar Como",
        defaultPath: "Escala Extra.xlsx",
        buttonLabel: "Salvar",
        filters: [{ name: "Excel Files", extensions: ["xlsx"] }],
      },
    );

    if (canceled || path == null) {
      return AppResponse.error(
        "Save has canceled",
        ScheduleSaveErrorCode.SAVE_CANCELED,
      );
    }

    const saveConfig: ScheduleFileSaveConfig = {
      fileInfo: { type: fileType },
      path,
    };

    state.fileSaveConfig = saveConfig;

    const result = await this.save(_, state);
    if (result.ok === false) {
      return AppResponse.error(result.error);
    }

    return AppResponse.ok(saveConfig);
  }

  async save(
    _: IpcMapping.IpcEvent,
    state: ScheduleState,
  ): Promise<AppResponse<void, ErrorCode.UNKNOW>> {
    const schedule = this.tableFactory.fromState(state);

    const { path } = state.fileSaveConfig;

    const serializer = this.getSerializer(state.fileSaveConfig);

    const buffer = await serializer.serialize(schedule);

    await fs.writeFile(path, buffer);

    return AppResponse.ok();
  }

  handler() {
    return IpcMapping.create(
      {
        load: this.load,
        loadOrdinary: this.loadOrdinary,
        generate: this.generate,
        save: this.save,
        saveAs: this.saveAs,
      },
      this,
    );
  }
}
