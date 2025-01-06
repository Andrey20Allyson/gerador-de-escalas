import { DutyEditor } from "./duty-editor";
import { TableEditor } from "./table-editor";

export interface DutyAddressData {
  readonly dutyIndex: number;
  readonly dayIndex: number;
}

export class DutyAddress {
  constructor(
    readonly table: TableEditor,
    readonly data: DutyAddressData,
  ) { }

  equals(address: DutyAddress) {
    return this.data.dayIndex === address.data.dayIndex && this.data.dutyIndex === address.data.dutyIndex;
  }

  key() {
    const array = new Uint16Array([this.data.dayIndex, this.data.dutyIndex]);

    const uint8Array = new Uint8Array(array.buffer)

    return String.fromCharCode(...uint8Array);
  }

  unref() {
    return this.table.getDay(this.data.dayIndex).getDuty(this.data.dutyIndex);
  }

  static create(table: TableEditor, dayIndex: number, dutyIndex: number) {
    return new DutyAddress(table, { dayIndex, dutyIndex })
  }

  static from(duty: DutyEditor) {
    return DutyAddress.create(duty.table, duty.day.index(), duty.index());
  }
}