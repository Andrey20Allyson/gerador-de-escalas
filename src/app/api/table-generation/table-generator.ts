import { ExtraDutyTableV2, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { ParseOrdinaryPayload, parseOrdinary } from "../utils/table";
import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { AppResponse, AppResponseType, ErrorCode } from "../app.base";
import { PreGenerateEditor, PreGenerateEditorDTO } from "./pre-generate-editor";

export interface GeneratedData {
  table: ExtraDutyTableV2;
  workers: WorkerInfo[];
}

export class TableGenerator {
  constructor(public data?: GeneratedData) { }

  clear() {
    delete this.data;
  }

  load(payload: ParseOrdinaryPayload) {
    const { year, month } = payload;

    const workers = parseOrdinary(payload);

    const table = new ExtraDutyTableV2({ year, month });

    this.data = { table, workers };
  }

  createPreGenerateEditor(): AppResponseType<PreGenerateEditorDTO, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data) return AppResponse.error(`Can't pre generate editor before load data!`, ErrorCode.DATA_NOT_LOADED);

    const editor = PreGenerateEditor.from(this.data.workers);

    return AppResponse.ok(editor.data);
  }

  save(data: PreGenerateEditorDTO): AppResponseType<void, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data) return AppResponse.error(`Can't save editor before load data!`, ErrorCode.DATA_NOT_LOADED);

    const editor = new PreGenerateEditor(data);

    editor.save(this.data.workers);

    return AppResponse.ok();
  }

  generate(): AppResponseType<void, ErrorCode.DATA_NOT_LOADED> {
    if (!this.data) return AppResponse.error(`Can't generate table before load data!`, ErrorCode.DATA_NOT_LOADED);
    
    const { table, workers } = this.data;

    table.clear();

    table.tryAssignArrayMultipleTimes(workers, 5e3);
    
    return AppResponse.ok();
  }

  async serialize(serializer: MainTableFactory): Promise<AppResponseType<ArrayBuffer, ErrorCode.DATA_NOT_LOADED>> {
    if (!this.data) return AppResponse.error(`Can't serialize before load data!`, ErrorCode.DATA_NOT_LOADED);
    
    const buffer = await serializer.generate(this.data.table, { sheetName: 'DADOS' });

    return AppResponse.ok(buffer.buffer)
  }
}