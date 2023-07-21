import type { Gender, Graduation } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { DutyEditor } from "./duty-editor";
import { TableEditor } from "./table-editor";
import { DutyAddress, DutyAddressData } from "./duty-address";

export interface WorkerEditorData {
  readonly workerID: number;

  dutyAddresses: Map<string, DutyAddressData>;
  graduation: Graduation;
  maxDuties: number;
  gender: Gender;
  name: string;
}

export class WorkerEditor {
  constructor(readonly table: TableEditor, readonly data: WorkerEditorData) { }

  *iterDuties(): Iterable<DutyEditor> {
    for (const [_, addressData] of this.data.dutyAddresses) {
      yield this.table
        .getDay(addressData.dayIndex)
        .getDuty(addressData.dutyIndex);
    }
  }

  *filterDuties(filter: (duty: DutyEditor) => boolean): Iterable<DutyEditor> {
    for (const duty of this.iterDuties()) {
      if (filter(duty)) yield duty;
    }
  }

  id() {
    return this.data.workerID;
  }

  name() {
    return this.data.name;
  }

  gender() {
    return this.data.gender;
  }

  graduation() {
    return this.data.graduation;
  }

  numOfDuties() {
    return this.data.dutyAddresses.size;
  }

  hasDuty(dutyAddress: DutyAddress) {
    return this.data.dutyAddresses.has(dutyAddress.key());
  }

  bindDuties(duties: Iterable<DutyEditor>) {
    let atLeastOneBound = false;

    for (const duty of duties) {
      const isBound = this.bindDuty(duty);
      if (isBound) {
        atLeastOneBound = true;
      }
    }

    return atLeastOneBound;
  }

  unbindAllDuties() {
    let atLeastOneUnbound = false;

    for (const [_, addressData] of this.data.dutyAddresses) {
      const dutyAddress = new DutyAddress(this.table, addressData);
      const duty = dutyAddress.unref();

      if (duty) {
        const isUnbound = this.unbindDuty(duty);
        if (isUnbound) {
          atLeastOneUnbound = true;
        }
      }
    }

    return atLeastOneUnbound;
  }

  bindDuty(duty: DutyEditor): boolean {
    const addedDuty = this.addDuty(duty.address());
    const addedWorker = duty.addWorker(this.id());

    return addedDuty && addedWorker;
  }
  
  unbindDuty(duty: DutyEditor): boolean {
    const deletedDuty = this.deleteDuty(duty.address()); 
    const deletedWorker = duty.deleteWorker(this.id());

    return deletedDuty && deletedWorker;
  }

  deleteDuty(address: DutyAddress) {
    const key = address.key();
    return this.data.dutyAddresses.delete(key);
  }

  addDuty(address: DutyAddress) {
    const { dutyAddresses } = this.data;
    const key = address.key();

    if (dutyAddresses.has(key)) return false;

    dutyAddresses.set(key, address.data);

    return true;
  }

  isFull() {
    return this.numOfDuties() >= this.data.maxDuties; 
  }

  static create(parent: TableEditor, workerID: number) {
    return new WorkerEditor(parent, {
      graduation: 'gcm',
      gender: 'N/A',
      maxDuties: 5,
      name: 'N/A',
      dutyAddresses: new Map(),
      workerID,
    });
  }
}