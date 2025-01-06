import type { Gender, Graduation } from "src/lib/structs";
import { DutyEditor } from "./duty-editor";
import { TableEditor } from "./table-editor";
import { DutyAddress, DutyAddressData } from "./duty-address";
import {
  OrdinaryWorkHandlerData,
  OrdinaryWorkHandler,
} from "./ordinary-handler";

export interface WorkerEditorData {
  readonly ordinary: OrdinaryWorkHandlerData;
  readonly workerID: number;

  dutyAddresses: Map<string, DutyAddressData>;
  graduation: Graduation;
  isDailyWorker: boolean;
  maxDuties: number;
  gender: Gender;
  name: string;
}

export class WorkerEditor {
  readonly ordinary: OrdinaryWorkHandler;

  constructor(
    readonly table: TableEditor,
    readonly data: WorkerEditorData,
  ) {
    this.ordinary = new OrdinaryWorkHandler(this);
  }

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
    const addedWorker = duty.addWorker(this);

    return addedDuty && addedWorker;
  }

  unbindDuty(duty: DutyEditor): boolean {
    const deletedDuty = this.deleteDuty(duty.address());
    const deletedWorker = duty.deleteWorker(this);

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

  isDailyWorker() {
    return this.data.isDailyWorker;
  }

  isFull() {
    return this.numOfDuties() >= this.data.maxDuties;
  }

  static create(parent: TableEditor, workerID: number) {
    return new WorkerEditor(parent, {
      ordinary: OrdinaryWorkHandler.createData(),
      dutyAddresses: new Map(),
      isDailyWorker: false,
      graduation: "gcm",
      gender: "N/A",
      maxDuties: 5,
      name: "N/A",
      workerID,
    });
  }
}
