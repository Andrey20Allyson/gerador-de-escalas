import { DayEditor } from "./day-editor";
import { removeFromArray } from "./utils";
import { WorkerEditorData, WorkerEditor } from "./worker-editor";

export interface DutyEditorData {
  readonly dayIndex: number;
  readonly index: number;
  
  workers: WorkerEditorData[];
  startsAt: number;
  endsAt: number;
}

export class DutyEditor {
  constructor(readonly parent: DayEditor, readonly data: DutyEditorData) { }

  index() {
    return this.data.index;
  }

  *iterWorkers(): Iterable<WorkerEditor> {
    for (const worker of this.data.workers) {
      if (worker) yield new WorkerEditor(this.parent.parent, worker);
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

  removeWorker(worker: WorkerEditorData) {
    return !!removeFromArray(this.data.workers, worker);
  }

  addWorker(worker: WorkerEditorData) {
    if (this.data.workers.includes(worker)) return false;

    this.data.workers.push(worker);

    return true;
  }

  createMap() {
    return new Map(this.data.workers.map(worker => [worker.workerID, worker] as const));
  }

  static create(parent: DayEditor, index: number) {
    return new DutyEditor(parent, {
      dayIndex: parent.data.index,
      startsAt: 0,
      workers: [],
      endsAt: 0,
      index,
    });
  }
}