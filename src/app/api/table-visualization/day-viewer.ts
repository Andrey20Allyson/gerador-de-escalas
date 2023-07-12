import { DutyViewerData, DutyViewer } from "./duty-viewer";
import { normalizeIndex } from "./index.utils";
import { TableViewer } from "./table-viewer";

export interface DayViewerData {
  duties: DutyViewerData[];
  index: number;
}

export class DayViewer {
  constructor(readonly parent: TableViewer, readonly data: DayViewerData) { }

  *iterDuties(): Iterable<DutyViewer> {
    for (let i = 0; i < this.numOfDuties(); i++) {
      yield this.getDuty(i);
    }
  }

  numOfDuties() {
    return this.parent.data.dutiesPerDay;
  }

  getDuty(index: number) {
    const normalizedIndex = normalizeIndex(index, this.numOfDuties());

    let duty = this.data.duties.at(normalizedIndex);
    if (duty) return new DutyViewer(this, duty);

    const viewer = DutyViewer.create(this, normalizedIndex);

    this.data.duties[normalizedIndex] = viewer.data;

    return viewer;
  }

  static create(parent: TableViewer, index: number) {
    return new DayViewer(parent, { duties: [], index });
  }
}