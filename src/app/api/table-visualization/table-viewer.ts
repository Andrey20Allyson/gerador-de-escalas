import { ExtraDutyTableV2, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { getNumOfDaysInMonth } from "@andrey-allyson/escalas-automaticas/dist/utils";
import { ParseTablePayload, parseTable } from "../utils/table";
import { DayViewer, DayViewerData } from "./day-viewer";
import { normalizeIndex } from "./index.utils";
import { WorkerViewer, WorkerViewerData } from "./worker-viewer";

export interface TableViewerData {
  workers: WorkerViewerData[];
  days: DayViewerData[];
  dutiesPerDay: number;
  nunOfDays: number;
  month: number;
  year: number;
}

export interface CreateTableViewerOptions {
  dutiesPerDay: number;
  year?: number;
  month?: number;
}

export class TableViewer {
  constructor(readonly data: TableViewerData) { }

  *iterDays(): Iterable<DayViewer> {
    for (let i = 0; i < this.data.nunOfDays; i++) {
      yield this.getDay(i);
    }
  }

  *iterWorkers(): Iterable<WorkerViewer> {
    for (const worker of this.data.workers) {
      yield new WorkerViewer(this, worker);
    }
  }

  numOfDays() {
    return this.data.nunOfDays;
  }

  numOfWorkers() {
    return this.data.workers.length;
  }

  getDay(index: number) {
    const normalizedIndex = normalizeIndex(index, this.numOfDays());

    let day = this.data.days.at(normalizedIndex);
    if (day) return new DayViewer(this, day);

    const viewer = DayViewer.create(this, normalizedIndex);

    this.data.days[normalizedIndex] = viewer.data;

    return viewer;
  }

  addWorker(worker: WorkerViewerData) {
    this.data.workers.push(worker);
  }

  static load(table: ExtraDutyTableV2) {
    const { year, month } = table.config;

    const viewer = TableViewer.create({
      dutiesPerDay: table.getDay(0).size,
      month,
      year,
    });

    const workerMap = new Map<WorkerInfo, WorkerViewer>();

    for (const entry of table.entries()) {
      const duty = viewer
        .getDay(entry.day.day)
        .getDuty(entry.duty.index);

      duty.setTime(entry.duty.start, entry.duty.end);

      const { name, gender, graduation } = entry.worker;

      let worker = workerMap.get(entry.worker);

      if (!worker) {
        worker = WorkerViewer.create(viewer);

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
    const { table } = parseTable(payload);

    return TableViewer.load(table);
  }

  static create(options: CreateTableViewerOptions) {
    const { dutiesPerDay, month = 0, year = 0 } = options;
    const nunOfDays = getNumOfDaysInMonth(month, year);

    return new TableViewer({ days: [], workers: [], month, year, nunOfDays, dutiesPerDay });
  }
}