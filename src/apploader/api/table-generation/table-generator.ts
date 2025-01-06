import { DefautlScheduleBuilder } from "src/lib/builders/default-builder";
import { Serializer } from "src/lib/serialization/out/serializer";
import { ExtraDutyTable, WorkerInfo } from "src/lib/structs";
import { ErrorCode } from "../mapping/error";
import { AppResponse } from "../mapping/response";
import { ParseOrdinaryPayload, parseOrdinary } from "../utils/table";
import { PreGenerateEditor, PreGenerateEditorDTO } from "./pre-generate-editor";

export interface GeneratedData {
  table: ExtraDutyTable;
  workers: WorkerInfo[];
}

export class TableGenerator {
  constructor(public data?: GeneratedData) {}

  clear() {
    delete this.data;
  }

  load(payload: ParseOrdinaryPayload) {
    const { year, month } = payload;

    const workers = parseOrdinary(payload);

    const table = new ExtraDutyTable({ year, month });

    this.data = { table, workers };
  }

  createPreGenerateEditor(): AppResponse<
    PreGenerateEditorDTO,
    ErrorCode.DATA_NOT_LOADED
  > {
    if (!this.data)
      return AppResponse.error(
        `Can't pre generate editor before load data!`,
        ErrorCode.DATA_NOT_LOADED,
      );

    const editor = PreGenerateEditor.from(this.data.workers);

    return AppResponse.ok(editor.data);
  }

  save(
    data: PreGenerateEditorDTO,
  ): AppResponse<void, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data)
      return AppResponse.error(
        `Can't save editor before load data!`,
        ErrorCode.DATA_NOT_LOADED,
      );

    const editor = new PreGenerateEditor(data);

    editor.save(this.data.workers);

    return AppResponse.ok();
  }

  generate(): AppResponse<void, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data)
      return AppResponse.error(
        `Can't generate table before load data!`,
        ErrorCode.DATA_NOT_LOADED,
      );

    const { table, workers } = this.data;

    table.clear();

    new DefautlScheduleBuilder(7e3).build(table, workers);

    return AppResponse.ok();
  }

  async serialize(
    serializer: Serializer,
  ): Promise<AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    if (!this.data)
      return AppResponse.error(
        `Can't serialize before load data!`,
        ErrorCode.DATA_NOT_LOADED,
      );

    const buffer = await serializer.serialize(this.data.table);

    return AppResponse.ok(buffer.buffer);
  }
}
