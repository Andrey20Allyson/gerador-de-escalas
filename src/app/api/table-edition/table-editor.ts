import { MainTableFactory } from "@andrey-allyson/escalas-automaticas/dist/auto-schedule/table-factories";
import { ExtraDutyTableV2, Holidays, WorkerInfo, WorkerRegistriesMap } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { LoadTableInput, parseTable } from "../utils/table";
import { EditableDutyTable, TableSlotMap } from "./editable-table";

export interface TableEditorLoadedData {
  outputSheetName: string;
  table: ExtraDutyTableV2;
  workers: WorkerInfo[];
}

export class TableEditor {
  loadedData: TableEditorLoadedData | null = null;

  constructor(
    readonly workerRegistryMap: WorkerRegistriesMap,
    readonly holidays: Holidays,
    readonly serializer: MainTableFactory,
  ) { }

  load(payload: LoadTableInput) {
    const { table, workers } = parseTable({
      tables: payload,
      holidays: this.holidays,
      workerRegistryMap: this.workerRegistryMap,
    });

    this.loadedData = {
      outputSheetName: payload.extraDutyTable.sheetName,
      workers,
      table,
    };
  }

  getLoadedData() {
    const data = this.loadedData;
    if (!data) throw new Error(`Data hasn't loaded yet`);

    return data;
  }

  createEditable() {
    const data = this.getLoadedData();

    return EditableDutyTable.load(data);
  }

  save(changes: TableSlotMap) {
    const data = this.getLoadedData();

    EditableDutyTable.applyChanges(changes, data.table, new Map(data.workers.map(mapWorkerFromName)));
  }

  async createSerializerCache() {
    return this.serializer.createCache();
  }

  async serialize() {
    const data = this.getLoadedData();

    return this.serializer.generate(data.table, {
      sheetName: data.outputSheetName,
    });
  }
}

function mapWorkerFromName(worker: WorkerInfo): [string, WorkerInfo] {
  return [worker.name, worker];
}