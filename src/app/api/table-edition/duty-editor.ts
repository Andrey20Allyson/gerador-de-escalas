import { DayEditor } from "./day-editor";
import { DutyAddress } from "./duty-address";
import { TableEditor } from "./table-editor";
import { WorkerEditor } from "./worker-editor";

export interface DutyEditorData {
  readonly dayIndex: number;
  readonly index: number;

  workerIDs: Set<number>;
  workerLimit: number;
  startsAt: number;
  endsAt: number;
}

export class DutyEditor {
  readonly table: TableEditor;

  constructor(readonly parent: DayEditor, readonly data: DutyEditorData) {
    this.table = this.parent.table
  }

  index() {
    return this.data.index;
  }

  *iterWorkers(): Iterable<WorkerEditor> {
    for (const id of this.data.workerIDs) {
      const worker = this.getWorker(id);
      if (worker) yield worker;
    }
  }

  address(): DutyAddress {
    return DutyAddress.from(this);
  }

  getWorker(id: number) {
    return this.table.getWorker(id);
  }

  setTime(startsAt: number, endsAt: number) {
    this.data.startsAt = startsAt;
    this.data.endsAt = endsAt;
  }

  numOfWorkers() {
    return this.data.workerIDs.size;
  }

  workers() {
    return this.data.workerIDs;
  }

  bindWorker(worker: WorkerEditor): boolean {
    return worker.bindDuty(this);
  }

  unbindWorker(worker: WorkerEditor): boolean {
    return worker.unbindDuty(this);
  }

  deleteWorker(workerID: number) {
    return this.data.workerIDs.delete(workerID);
  }

  addWorker(workerID: number) {
    const { workerIDs } = this.data;

    if (workerIDs.has(workerID)) return false

    workerIDs.add(workerID);

    return true;
  }

  isFull() {
    return this.numOfWorkers() >= this.data.workerLimit;
  }

  static create(parent: DayEditor, index: number) {
    return new DutyEditor(parent, {
      dayIndex: parent.data.index,
      workerIDs: new Set(),
      workerLimit: 3,
      startsAt: 0,
      endsAt: 0,
      index,
    });
  }
}