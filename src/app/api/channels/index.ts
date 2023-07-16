import type { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib/structs/worker-info";
import { AppResponseType, ErrorCode, FSErrorCode } from "../app.base";
import { TableEditorData } from "../table-edition/table-editor";
import { ReadTablePayload } from "../utils/table";
import { ChannelsFrom, IPCHandler, IPCInvoker, NameChannels } from "./utils";

export interface LoadedData {
  readonly workers: readonly WorkerInfo[];
  readonly sheetName: string;
  readonly month: number;
  readonly year: number;
}

export namespace AppAPI {
  export interface Channels {
    utils: Utils.Channels;
    editor: Editor.Channels;
    generator: Generator.Channels;
  }
}

export namespace AppAPI.Utils {
  export interface Channels {
    getSheetNames(filePath: string): AppResponseType<string[], FSErrorCode.READ>;
  }
}

export namespace AppAPI.Editor {
  export interface Channels {
    load(payload: ReadTablePayload): AppResponseType<void, ErrorCode.INVALID_INPUT>;
    save(data: TableEditorData): AppResponseType<void, ErrorCode.DATA_NOT_LOADED>;
    getEditor(): AppResponseType<TableEditorData, ErrorCode.DATA_NOT_LOADED>;
    serialize(): AppResponseType<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>;
    clear(): void;
  }
}

export namespace AppAPI.Generator {
  export interface LoadPayload {
    sheetName: string;
    filePath: string;
    month: number;
    year: number;
  }

  export interface Channels {
    load(payload: LoadPayload): AppResponseType<void, ErrorCode.INVALID_INPUT>;
    getWorkerInfo(): AppResponseType<WorkerInfo[]>;
    generate(): AppResponseType<void, ErrorCode.DATA_NOT_LOADED>;
    serialize(): AppResponseType<ArrayBuffer>;
    clear(): void;
  }
}

export type AppChannels = ChannelsFrom<AppAPI.Channels>;
export interface NamedChannels extends NameChannels<AppAPI.Channels> { }

export interface AppHandler extends IPCHandler<AppChannels> { }
export interface AppInvoker extends IPCInvoker<AppChannels> { }