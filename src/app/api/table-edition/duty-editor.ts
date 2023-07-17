import { DayEditor } from "./day-editor";
import { DutyAddress } from "./duty-address";
import { TableEditor } from "./table-editor";
import { WorkerEditor } from "./worker-editor";

export interface DutyEditorData {
  readonly dayIndex: number;
  readonly index: number;

  workerIDs: Set<number>;
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

  deleteWorker(workerID: number) {
    return this.data.workerIDs.delete(workerID);
  }

  addWorker(workerID: number) {
    const { workerIDs } = this.data;

    if (workerIDs.has(workerID)) return false

    workerIDs.add(workerID);

    return true;
  }

  static create(parent: DayEditor, index: number) {
    return new DutyEditor(parent, {
      dayIndex: parent.data.index,
      workerIDs: new Set(),
      startsAt: 0,
      endsAt: 0,
      index,
    });
  }
}