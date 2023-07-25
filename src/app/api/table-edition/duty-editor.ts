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

  rules() {
    return this.table.rules();
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
    this.data.genderQuantity[worker.gender()]++;
    this.data.graduationQuantity[worker.graduation()]++;
  }

  decrementQuantity(worker: WorkerEditor) {
    this.data.genderQuantity[worker.gender()]--;
    this.data.graduationQuantity[worker.graduation()]--;
  }

  gerderQuantityOf(gender: Gender): number {
    return this.data.genderQuantity[gender];
  }

  graduationQuantityOf(graduation: Graduation): number {
    return this.data.graduationQuantity[graduation];
  }

  addWorker(worker: WorkerEditor): boolean {
    const { workerIDs } = this.data;

    if (workerIDs.has(worker.id())) return false

    workerIDs.add(worker.id());
    this.incrementQuantity(worker);

    return true;
  }

  isNightly() {
    return this.data.startsAt >= 18 || this.data.startsAt < 7;
  }

  prevDuty(): DutyEditor | undefined {
    const { table, day } = this;

    if (this.index() > 0) {
      return day.getDuty(this.index() - 1);
    } else if (day.index() > 0) {
      return table.getDay(day.index() - 1).getDuty(-1);
    }
  }

  nextDuty(): DutyEditor | undefined {
    const { table, day } = this;

    const lastDayIndex = table.numOfDays() - 1;
    const lastDutyIndex = day.numOfDuties() - 1;

    if (this.index() < lastDutyIndex) {
      return day.getDuty(this.index() + 1);
    } else if (day.index() < lastDayIndex) {
      return table.getDay(day.index() + 1).getDuty(0)
    }
  }

  breaksTimeOffRule(worker: WorkerEditor): boolean {
    const workerID = worker.id();

    return this.table.rules().timeOffRule
      && ((this.prevDuty()?.includes(workerID) ?? false) || (this.nextDuty()?.includes(workerID) ?? false));
  }

  breaksOrdinaryRule(worker: WorkerEditor): boolean {
    return this.rules().ordinaryRule && worker.ordinary.collidesWithDuty(this);
  }

  breaksInspRule(worker: WorkerEditor): boolean {
    return this.rules().inspRule
      && this.graduationQuantityOf('insp') > 0
      && worker.graduation() === 'insp';
  }

  breaksGenderRule(worker: WorkerEditor): boolean {
    return this.rules().femaleRule
      && this.numOfWorkers() <= 1
      && worker.gender() === 'female'
      && this.gerderQuantityOf('male') === 0;
  }

  canAddWorker(worker: WorkerEditor) {
    const breaksSomeRule = this.isFull()
      || this.includes(worker.id())
      || this.breaksInspRule(worker)
      || this.breaksGenderRule(worker)
      || this.breaksTimeOffRule(worker)
      || this.breaksOrdinaryRule(worker);

    return !breaksSomeRule;
  }

  includes(workerID: number): boolean {
    return this.data.workerIDs.has(workerID);
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