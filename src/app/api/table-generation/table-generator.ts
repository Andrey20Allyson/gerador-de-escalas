import { ExtraDutyTableV2, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { ParseOrdinaryPayload, parseOrdinary } from "../utils/table";

export interface GeneratedData {
  table: ExtraDutyTableV2;
  workers: WorkerInfo[];
}

export class TableGenerator {
  constructor(public data?: GeneratedData) { }

  load(payload: ParseOrdinaryPayload) {
    const { year, month } = payload;

    const workers = parseOrdinary(payload);

    const table = new ExtraDutyTableV2({ year, month });

    this.data = { table, workers };
  }

  getDaysOfWorkEditor() {
    
  }

  generate() {
    if (!this.data) return null;
    
    const { table, workers } = this.data;

    table.tryAssignArrayMultipleTimes(workers, 5e3);
    
    return table;
  }
}