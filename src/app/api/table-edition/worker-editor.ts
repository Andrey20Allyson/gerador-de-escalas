import { Gender, Graduation } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
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
      return this.table
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

  static create(parent: TableEditor, workerID: number) {
    return new WorkerEditor(parent, {
      graduation: Graduation.GCM,
      gender: Gender.UNDEFINED,
      maxDuties: 5,
      name: 'N/A',
      dutyAddresses: new Map(),
      workerID,
    });
  }
}