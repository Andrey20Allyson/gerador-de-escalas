import { Graduation, Gender } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { DutyViewerData, DutyViewer } from "./duty-viewer";
import { TableViewer } from "./table-viewer";
import { removeFromArray } from "./index.utils";

export interface WorkerViewerData {
  duties: DutyViewerData[];
  graduation: Graduation;
  maxDuties: number;
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

  getName() {
    return this.data.name;
  }

  getGender() {
    return this.data.gender;
  }

  getGraduation() {
    return this.data.graduation;
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

  removeDuty(duty: DutyViewerData) {
    return !!removeFromArray(this.data.duties, duty);
  }

  addDuty(duty: DutyViewerData) {
    if (this.data.duties.includes(duty) || this.numOfDuties() >= this.data.maxDuties) return false;

    this.data.duties.push(duty);

    return true;
  }

  static create(parent: TableViewer) {
    return new WorkerViewer(parent, { duties: [], maxDuties: 5, gender: Gender.UNDEFINED, graduation: Graduation.GCM, name: 'N/A' });
  }
}