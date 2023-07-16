import { Graduation, Gender } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-lib";
import { DutyEditorData, DutyEditor } from "./duty-editor";
import { TableEditor } from "./table-editor";
import { removeFromArray } from "./index.utils";

export interface WorkerEditorData {
  readonly workerID: number;
  
  duties: DutyEditorData[];
  graduation: Graduation;
  maxDuties: number;
  gender: Gender;
  name: string;
}

export class WorkerEditor {
  constructor(readonly parent: TableEditor, readonly data: WorkerEditorData) { }

  *iterDuties(): Iterable<DutyEditor> {
    for (let i = 0; i < this.numOfDuties(); i++) {
      const duty = this.dutyAt(i);
      if (!duty) continue;
      yield duty;
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

  removeDuty(duty: DutyEditorData) {
    return !!removeFromArray(this.data.duties, duty);
  }

  addDuty(duty: DutyEditorData) {
    if (this.data.duties.includes(duty) || this.numOfDuties() >= this.data.maxDuties) return false;

    this.data.duties.push(duty);

    return true;
  }

  static create(parent: TableEditor, workerID: number) {
    return new WorkerEditor(parent, {
      graduation: Graduation.GCM,
      gender: Gender.UNDEFINED,
      maxDuties: 5,
      name: 'N/A', 
      duties: [],
      workerID,
    });
  }
}