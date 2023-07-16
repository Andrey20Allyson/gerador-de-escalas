import { ExtraDutyTable, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { getNumOfDaysInMonth } from "@andrey-allyson/escalas-automaticas/dist/utils";
import { ParseTablePayload, parseExtraTable } from "../utils/table";
import { DayEditor, DayEditorData } from "./day-editor";
import { normalizeIndex } from "./utils";
import { WorkerEditor, WorkerEditorData } from "./worker-editor";

export interface TableEditorData {
  readonly nunOfDays: number;
  readonly month: number;
  readonly year: number;
  
  workers: Map<number, WorkerEditorData>;
  days: DayEditorData[];
  dutiesPerDay: number;
}

export interface CreateTableEditorOptions {
  dutiesPerDay: number;
  month?: number;
  year?: number;
}

export class TableEditor {
  constructor(readonly data: TableEditorData) { }

  *iterDays(): Iterable<DayEditor> {
    for (let i = 0; i < this.data.nunOfDays; i++) {
      yield this.getDay(i);
    }
  }

  *filterWorker(filter: (worker: WorkerEditor) => boolean): Iterable<WorkerEditor> {
    for (const worker of this.iterWorkers()) {
      if (filter(worker)) yield worker;
    }
  }

  *iterWorkers(): Iterable<WorkerEditor> {
    for (const [_, data] of this.data.workers) {
      yield new WorkerEditor(this, data);
    }
  }

  numOfDays() {
    return this.data.nunOfDays;
  }

  numOfWorkers() {
    return this.data.workers.size;
  }

  getWorker(id: number) {
    const data = this.data.workers.get(id);
    return data ? new WorkerEditor(this, data) : undefined;
  }

  getDay(index: number) {
    const normalizedIndex = normalizeIndex(index, this.numOfDays());

    let day = this.data.days.at(normalizedIndex);
    if (day) return new DayEditor(this, day);

    const viewer = DayEditor.create(this, normalizedIndex);

    this.data.days[normalizedIndex] = viewer.data;

    return viewer;
  }

  addWorker(worker: WorkerEditorData) {
    this.data.workers.set(worker.workerID, worker);
  }

  removeWorker(id: number) {
    return this.data.workers.delete(id);
  }

  save(table: ExtraDutyTable, workerMap: ReadonlyMap<number, WorkerInfo>) {
    table.clear();

    for (const [id, worker] of workerMap) {
      const workerEditor = this.getWorker(id);
      if (!workerEditor) throw new Error(`Can't find worker data with id #${id}!`);

      for (const dutyEditor of workerEditor.iterDuties()) {
        const duty = table
          .getDay(dutyEditor.parent.index())
          .getDuty(dutyEditor.index());

        duty.add(worker, true);
      }
    }

    return table;
  }

  static from(table: ExtraDutyTable) {
    const { year, month } = table.config;

    const viewer = TableEditor.create({
      dutiesPerDay: table.getDay(0).size,
      month,
      year,
    });

    const workerMap = new Map<WorkerInfo, WorkerEditor>();

    for (const entry of table.entries()) {
      const duty = viewer
        .getDay(entry.day.day)
        .getDuty(entry.duty.index);

      duty.setTime(entry.duty.start, entry.duty.end);

      const { name, gender, graduation, fullWorkerID } = entry.worker;

      let worker = workerMap.get(entry.worker);

      if (!worker) {
        worker = WorkerEditor.create(viewer, fullWorkerID);

        worker.data.name = name;
        worker.data.gender = gender;
        worker.data.graduation = graduation;

        viewer.addWorker(worker.data);

        workerMap.set(entry.worker, worker);
      }

      worker.addDuty(duty.data);
      duty.addWorker(worker.data);
    }

    return viewer;
  }

  static parse(payload: ParseTablePayload) {
    const { table } = parseExtraTable(payload);

    return TableEditor.from(table);
  }

  static create(options: CreateTableEditorOptions) {
    const { dutiesPerDay, month = 0, year = 0 } = options;
    const nunOfDays = getNumOfDaysInMonth(month, year);

    return new TableEditor({ days: [], workers: new Map(), month, year, nunOfDays, dutiesPerDay });
  }
}