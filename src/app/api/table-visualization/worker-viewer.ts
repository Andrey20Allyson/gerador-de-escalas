import { Graduation, Gender } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { DutyViewerData, DutyViewer } from "./duty-viewer";
import { TableViewer } from "./table-viewer";

export interface WorkerViewerData {
  duties: DutyViewerData[];
  graduation: Graduation;
  gender: Gender;
  name: string;
}

export class WorkerViewer {
  constructor(readonly parent: TableViewer, readonly data: WorkerViewerData) { }

  *iterDuties(): Iterable<DutyViewer> {
    for (let i = 0; i < this.numOfDuties(); i++) {
      const duty = this.dutyAt(i);
      if (!duty) continue;
      yield duty;
    }
  }

  numOfDuties() {
    return this.data.duties.length;
  }

  dutyAt(index: number) {
    const dutyData = this.data.duties.at(index);
    if (!dutyData) return;

    const { dayIndex, index: dutyIndex } = dutyData;

    const duty = this.parent
      .getDay(dayIndex)
      .getDuty(dutyIndex);

    if (duty.data !== dutyData) throw new Error(`DutyViewerData don't match at index ${index}!`);

    return duty;
  }

  addDuty(duty: DutyViewerData) {
    this.data.duties.push(duty);
  }

  static create(parent: TableViewer) {
    return new WorkerViewer(parent, { duties: [], gender: Gender.UNDEFINED, graduation: Graduation.GCM, name: 'N/A' });
  }
}