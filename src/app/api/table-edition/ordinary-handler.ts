import { DutyEditor } from "./duty-editor";
import { TableEditor } from "./table-editor";
import { WorkerEditor } from "./worker-editor";

export interface OrdinaryWorkHandlerData {
  days: Set<number>;
  startsAt: number;
  duration: number;
}

export class OrdinaryWorkHandler {
  readonly table: TableEditor;
  readonly data: OrdinaryWorkHandlerData;

  constructor(readonly worker: WorkerEditor) {
    this.table = worker.table;
    this.data = worker.data.ordinary;
  }

  workAt(day: number): boolean {
    return this.data.days.has(day);
  }

  add(day: number) {
    this.data.days.add(day);
  }

  collidesWithDuty(duty: DutyEditor): boolean {
    if (this.worker.isDailyWorker() && duty.isNightly()) return false;

    const dayIndex = duty.day.index();

    if (this.workAt(dayIndex)) return true;

    const prevDayIndex = dayIndex - 1;
    const dutyDuration = duty.data.endsAt - duty.data.startsAt;
    const dutyTimeOffStart = duty.data.startsAt - this.data.duration;
    const ordinaryStart = this.data.startsAt;
    const ordinaryEnd = ordinaryStart + this.data.duration;

    if (prevDayIndex >= 0 && this.workAt(prevDayIndex) && dutyTimeOffStart + 24 < ordinaryEnd) return true;

    const lastDayIndex = this.table.numOfDays() - 1;
    const nextDayIndex = dayIndex + 1;
    const dutyTimeOffEnd = duty.data.endsAt + dutyDuration;

    if (nextDayIndex <= lastDayIndex && this.workAt(nextDayIndex) && dutyTimeOffEnd - 24 > ordinaryStart) return true;

    return false;
  }

  static createData(): OrdinaryWorkHandlerData {
    return {
      days: new Set(),
      duration: 0,
      startsAt: 0,
    };
  }
}