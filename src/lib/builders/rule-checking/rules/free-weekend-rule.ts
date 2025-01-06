import { DayOfWeek } from "../../../../utils";
import { ExtraDuty, WorkerInfo } from "../../../structs";
import { Day } from "../../../structs/day";
import { AssignmentRule } from "../assignment-rule";

export class FreeWeekendAssignmentRule implements AssignmentRule {
  protected _hasOrdinaryOnPrevThursdayOrFriday(
    worker: WorkerInfo,
    day: Day,
  ): boolean {
    const prevFriday = day.seekPrevWeekday(DayOfWeek.FRIDAY);
    const prevThursday = prevFriday.prev();
    const currentMonth = worker.daysOfWork.month.index;

    if (prevFriday.month === currentMonth) {
      const worksOnFriday = worker.daysOfWork.workOn(prevFriday.index);

      if (worksOnFriday) {
        return true;
      }
    }

    if (prevThursday.month === currentMonth) {
      const worksOnThursday = worker.daysOfWork.workOn(prevThursday.index);

      if (worksOnThursday) {
        return true;
      }
    }

    return false;
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const isntFullDayWorker = worker.workTime.duration !== 24;

    if (isntFullDayWorker) {
      return true;
    }

    const isWeekend = duty.day.date.isWeekEnd();

    if (!isWeekend) {
      return true;
    }

    const hasOrdinaryOnPrevThursdayOrFriday =
      this._hasOrdinaryOnPrevThursdayOrFriday(worker, duty.day.date);

    return !hasOrdinaryOnPrevThursdayOrFriday;
  }
}
