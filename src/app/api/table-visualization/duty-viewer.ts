import { DayViewer } from "./day-viewer";
import { WorkerViewerData, WorkerViewer } from "./worker-viewer";

export interface DutyViewerData {
  workers: WorkerViewerData[];
  dayIndex: number;
  startsAt: number;
  endsAt: number;
  index: number;
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

  numOfWorkers() {
    return this.data.workers.length;
  }

  workers() {
    return this.data.workers;
  }

  addWorker(worker: WorkerViewerData) {
    this.data.workers.push(worker);
  }

  createMap() {
    return new Map(this.data.workers.map(worker => [worker.name, worker] as const));
  }

  static create(parent: DayViewer, index: number) {
    return new DutyViewer(parent, {
      dayIndex: parent.data.index,
      startsAt: 0,
      workers: [],
      endsAt: 0,
      index,
    });
  }
}