import { MainTableFactory } from "../../auto-schedule/xlsx-builders";
import { ExtraDutyTable, WorkerInfo } from "../../auto-schedule/extra-duty-lib";
import { DefautlScheduleBuilder } from "../../auto-schedule/extra-duty-lib/builders/default-builder";
import { ParseOrdinaryPayload, parseOrdinary } from "../utils/table";
import { PreGenerateEditor, PreGenerateEditorDTO } from "./pre-generate-editor";
import { ErrorCode } from "../mapping/error";
import { AppResponse } from "../mapping/response";
import { SerializationContext } from "../../auto-schedule/schedule-serialization/serializers/serialization-context";
import { SerializationStratergy } from "../../auto-schedule/schedule-serialization/serializers/serialization-stratergy";

export interface GeneratedData {
  table: ExtraDutyTable;
  workers: WorkerInfo[];
}

export class TableGenerator {
  readonly serializer: SerializationContext;

  constructor(public data?: GeneratedData) {
    this.serializer = new SerializationContext();
  }

  clear() {
    delete this.data;
  }

  load(payload: ParseOrdinaryPayload) {
    const { year, month } = payload;

    const workers = parseOrdinary(payload);

    const table = new ExtraDutyTable({ year, month });

    this.data = { table, workers };
  }

  createPreGenerateEditor(): AppResponse<PreGenerateEditorDTO, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data) return AppResponse.error(`Can't pre generate editor before load data!`, ErrorCode.DATA_NOT_LOADED);

    const editor = PreGenerateEditor.from(this.data.workers);

    return AppResponse.ok(editor.data);
  }

  save(data: PreGenerateEditorDTO): AppResponse<void, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data) return AppResponse.error(`Can't save editor before load data!`, ErrorCode.DATA_NOT_LOADED);

    const editor = new PreGenerateEditor(data);

    editor.save(this.data.workers);

    return AppResponse.ok();
  }

  generate(): AppResponse<void, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data) return AppResponse.error(`Can't generate table before load data!`, ErrorCode.DATA_NOT_LOADED);
    
    const { table, workers } = this.data;

    table.clear();

    new DefautlScheduleBuilder(7e3).build(table, workers);

    return AppResponse.ok();
  }

  async serialize(stratergy: SerializationStratergy): Promise<AppResponse<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    if (!this.data) return AppResponse.error(`Can't serialize before load data!`, ErrorCode.DATA_NOT_LOADED);
    
    this.serializer.setStratergy(stratergy);
    const buffer = await this.serializer.serialize(this.data.table);

    return AppResponse.ok(buffer.buffer)
  }
}