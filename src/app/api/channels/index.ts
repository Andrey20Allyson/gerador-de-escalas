import type { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib/structs/worker-info";
import { AppError, AppErrorType, AppResponse, AppResponseType, ErrorCode, FSErrorCode } from "../app.base";
import { TableEditorData } from "../table-edition/table-editor";
import { ReadTablePayload } from "../utils/table";
import { ChannelsFrom, IPCHandler, IPCInvoker, NameChannels } from "./utils";
import { PreGenerateEditorDTO } from "../table-generation/pre-generate-editor";

export interface LoadedData {
  readonly workers: readonly WorkerInfo[];
  readonly sheetName: string;
  readonly month: number;
  readonly year: number;
}

type OptionalPromise<T> = Promise<T> | T;

type AppChannelHandler = {
  [K in string]: ((...args: any) => OptionalPromise<void | AppResponseType<unknown, unknown>>) | AppChannelHandler;
}

interface AppHandlerFactory {
  handler(): AppChannelHandler;
}

class e implements AppHandlerFactory {
  async login() {

  }

  handler() {
    const { login } = this;

    return { login } satisfies AppChannelHandler;
  }
}

type LoginHandler = ReturnType<e['handler']>;

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
  export type SerializationMode = 'payment' | 'divugation' | 'day-list';

  export interface Channels {
    load(payload: ReadTablePayload): AppResponseType<void, ErrorCode.INVALID_INPUT>;
    save(data: TableEditorData): AppResponseType<void, ErrorCode.DATA_NOT_LOADED>;
    getEditor(): AppResponseType<TableEditorData, ErrorCode.DATA_NOT_LOADED>;
    serialize(mode: SerializationMode): AppResponseType<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>;
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

  export interface PreGenerateEditorChannel {
    save(data: PreGenerateEditorDTO): AppResponseType<void, ErrorCode.DATA_NOT_LOADED | ErrorCode.INVALID_INPUT>;
    getEditor(): AppResponseType<PreGenerateEditorDTO, ErrorCode.DATA_NOT_LOADED>;
  }

  export interface Channels {
    preGenerateEditor: PreGenerateEditorChannel;
    load(payload: LoadPayload): AppResponseType<void, ErrorCode.INVALID_INPUT>;
    serialize(): AppResponseType<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>;
    generate(): AppResponseType<void, ErrorCode.DATA_NOT_LOADED>;
    clear(): void;
  }
}

export type AppChannels = ChannelsFrom<AppAPI.Channels>;
export interface NamedChannels extends NameChannels<AppAPI.Channels> { }

export interface AppHandler extends IPCHandler<AppChannels> { }
export interface AppInvoker extends IPCInvoker<AppChannels> { }