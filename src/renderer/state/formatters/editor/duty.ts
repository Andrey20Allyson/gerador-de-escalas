import { DutyData, TableData } from "../../../../app/api/table-reactive-edition/table";
import { DateFormatter } from "./day";

export class DutyFormatter {
  private readonly _dutyHours = [
    '1 as 7h',
    '7 as 13h',
    '13 as 19h',
    '19 as 1h',
  ];

  constructor(
    private readonly table: TableData,
    private readonly duty: DutyData
  ) { }

  hours(): string {
    const index = this.duty.index % this._dutyHours.length;

    return this._dutyHours.at(index)!;
  }

  day(): string {
    const formatter = new DateFormatter(this.table, this.duty.date);

    return formatter.day();
  }
}