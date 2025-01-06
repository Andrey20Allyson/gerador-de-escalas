import { DutyEditorData, DutyEditor } from "./duty-editor";
import { normalizeIndex } from "./utils";
import { TableEditor } from "./table-editor";
import { dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils/week-days";

export interface DayEditorData {
  readonly index: number;

  duties: DutyEditorData[];
}

export class DayEditor {
  constructor(readonly table: TableEditor, readonly data: DayEditorData) { }

  index() {
    return this.data.index;
  }

  weekDayIndex() {
    const { year, month } = this.table.data;

    const firstMonday = firstMondayFromYearAndMonth(year, month);

    return dayOfWeekFrom(firstMonday, this.index());
  }

  *iterDuties(): Iterable<DutyEditor> {
    for (let i = 0; i < this.numOfDuties(); i++) {
      yield this.getDuty(i);
    }
  }

  numOfDuties() {
    return this.table.data.dutiesPerDay;
  }

  getDuty(index: number) {
    const normalizedIndex = normalizeIndex(index, this.numOfDuties());

    let duty = this.data.duties.at(normalizedIndex);
    if (duty) return new DutyEditor(this, duty);

    const viewer = DutyEditor.create(this, normalizedIndex);

    this.data.duties[normalizedIndex] = viewer.data;

    return viewer;
  }

  static create(parent: TableEditor, index: number) {
    return new DayEditor(parent, { duties: [], index });
  }
}