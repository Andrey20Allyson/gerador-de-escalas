import type { Gender, Graduation } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { DayEditor } from "./day-editor";
import { DutyAddress } from "./duty-address";
import { TableEditor } from "./table-editor";
import { WorkerEditor } from "./worker-editor";

export interface DutyEditorData {
  readonly dayIndex: number;
  readonly index: number;

  graduationQuantity: Record<Graduation, number>;
  genderQuantity: Record<Gender, number>;
  workerIDs: Set<number>;
  workerLimit: number;
  startsAt: number;
  endsAt: number;
}

export class DutyEditor {
  readonly table: TableEditor;

  constructor(readonly day: DayEditor, readonly data: DutyEditorData) {
    this.table = this.day.table
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

  deleteWorker(worker: WorkerEditor): boolean {
    if (!this.data.workerIDs.delete(worker.id())) return false;
    
    this.decrementQuantity(worker);

    return true;
  }

  incrementQuantity(worker: WorkerEditor) {

  }

  decrementQuantity(worker: WorkerEditor) {

  }

  addWorker(worker: WorkerEditor): boolean {
    const { workerIDs } = this.data;

    if (workerIDs.has(worker.id())) return false

    workerIDs.add(worker.id());
    this.incrementQuantity(worker);

    return true;
  }

  breaksOrdinaryRule(worker: WorkerEditor) {

  }

  breaksInspRule(worker: WorkerEditor) {

  }

  breaksGenderRule(worker: WorkerEditor) {

  }

  canAddWorker(worker: WorkerEditor) {
    const { table, day } = this;
    
    if (!table.isRulesActived()) return true;


  }

  isFull() {
    return this.numOfWorkers() >= this.data.workerLimit;
  }

  static create(parent: DayEditor, index: number) {
    return new DutyEditor(parent, {
      dayIndex: parent.data.index,
      genderQuantity: {
        female: 0,
        "N/A": 0,
        male: 0,
      },
      graduationQuantity: {
        "sub-insp": 0,
        insp: 0,
        gcm: 0,
      },
      workerIDs: new Set(),
      workerLimit: 3,
      startsAt: 0,
      endsAt: 0,
      index,
    });
  }
}