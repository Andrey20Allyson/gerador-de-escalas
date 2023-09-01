import { AppResponse, ErrorCode, FSErrorCode } from "../app.base";
import { TableEditorData } from "../table-edition/table-editor";
import { PreGenerateEditorDTO } from "../table-generation/pre-generate-editor";
import { ReadTablePayload } from "../utils/table";
import { ChannelsFrom, IPCHandler, IPCInvoker, NameChannels } from "./utils";

export namespace AppAPI {
  export interface Channels {
    utils: Utils.Channels;
    editor: Editor.Channels;
    generator: Generator.Channels;
  }
}

export namespace AppAPI.Utils {
  export interface Channels {
    getSheetNames(filePath: string): AppResponse<string[], FSErrorCode.READ>;
  }
}

export namespace AppAPI.Editor {
  export type SerializationMode = 'payment' | 'divugation' | 'day-list';

  export interface Channels {
    load(payload: ReadTablePayload): AppResponse<void, ErrorCode.INVALID_INPUT>;
    save(data: TableEditorData): AppResponse<void, ErrorCode.DATA_NOT_LOADED>;
    getEditor(): AppResponse<TableEditorData, ErrorCode.DATA_NOT_LOADED>;
    serialize(mode: SerializationMode): AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>;
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
    save(data: PreGenerateEditorDTO): AppResponse<void, ErrorCode.DATA_NOT_LOADED | ErrorCode.INVALID_INPUT>;
    getEditor(): AppResponse<PreGenerateEditorDTO, ErrorCode.DATA_NOT_LOADED>;
  }

  export interface Channels {
    preGenerateEditor: PreGenerateEditorChannel;
    load(payload: LoadPayload): AppResponse<void, ErrorCode.INVALID_INPUT>;
    serialize(): AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>;
    generate(): AppResponse<void, ErrorCode.DATA_NOT_LOADED>;
    clear(): void;
  }
}

export type AppChannels = ChannelsFrom<AppAPI.Channels>;
export interface NamedChannels extends NameChannels<AppAPI.Channels> { }

export interface AppHandler extends IPCHandler<AppChannels> { }
export interface AppInvoker extends IPCInvoker<AppChannels> { }