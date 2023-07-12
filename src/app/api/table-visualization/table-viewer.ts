import { Gender, Graduation, WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { ParseTablePayload, parseTable } from "../utils/table";

export interface WorkerViewerData {
  graduation: Graduation;
  duties: DutyViewerData[];
  gender: Gender;
  name: string;
}

export interface DutyViewerData {
  workers: WorkerViewerData[];
  startsAt: number;
  endsAt: number;
  index: number;
}

export interface DayViewerData {
  duties: DutyViewerData[];
  index: number;
}

export interface TableViewerData {
  year: number;
  month: number;
  days: DayViewerData[];
  workers: WorkerViewerData[];
}

export class WorkerViewer {
  constructor(readonly parent: TableViewer, readonly data: WorkerViewerData) { }

  addDuty(duty: DutyViewerData) {
    this.data.duties.push(duty);
  }

  static create(parent: TableViewer) {
    return new WorkerViewer(parent, { duties: [], gender: Gender.UNDEFINED, graduation: Graduation.GCM, name: 'N/A' });
  }
}

export class DutyViewer {
  constructor(readonly parent: DayViewer, readonly data: DutyViewerData) { }

  *iterWorkers(): Iterable<WorkerViewer> {
    for (const worker of this.data.workers) {
      if (worker) yield new WorkerViewer(this.parent.parent, worker);
    }
  }

  setTime(startsAt: number, endsAt: number) {
    this.data.startsAt = startsAt;
    this.data.endsAt = endsAt;
  }

  workers() {
    return this.data.workers;
  }

  addWorker(worker: WorkerViewerData) {
    this.data.workers.push(worker);
  }

  createMap() {

  }

  static create(parent: DayViewer, index: number) {
    return new DutyViewer(parent, { endsAt: 0, index, startsAt: 0, workers: [] });
  }
}

export class DayViewer {
  constructor(readonly parent: TableViewer, readonly data: DayViewerData) { }

  *iterDuties(): Iterable<DutyViewer> {
    for (const duty of this.data.duties) {
      if (duty) yield new DutyViewer(this, duty);
    }
  }

  getDuty(index: number) {
    let duty = this.data.duties.at(index);
    if (duty) return new DutyViewer(this, duty);

    const viewer = DutyViewer.create(this, index);

    this.data.duties[index] = viewer.data;

    return viewer;
  }

  static create(parent: TableViewer, index: number) {
    return new DayViewer(parent, { duties: [], index });
  }
}

export class TableViewer {
  constructor(readonly data: TableViewerData) { }

  getDay(index: number) {
    let day = this.data.days.at(index);
    if (day) return new DayViewer(this, day);

    const viewer = DayViewer.create(this, index);

    this.data.days[index] = viewer.data;

    return viewer;
  }

  addWorker(worker: WorkerViewerData) {
    this.data.workers.push(worker);
  }

  static parse(payload: ParseTablePayload) {
    const { table, workers } = parseTable(payload);
    const { year, month } = table.config;

    console.log(workers.map(worker => worker.gender));

    const viewer = TableViewer.create(year, month);
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

        workerMap.set(entry.worker, worker);
      }

      worker.addDuty(duty.data);
      duty.addWorker(worker.data);
    }

    for (const [_, worker] of workerMap) {
      viewer.addWorker(worker.data);
    }

    return viewer;
  }

  static create(year = 0, month = 0) {
    return new TableViewer({ days: [], workers: [], month, year });
  }
}