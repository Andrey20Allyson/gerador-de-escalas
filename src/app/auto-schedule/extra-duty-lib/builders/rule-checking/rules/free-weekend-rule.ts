import { DayOfWeek } from "../../../../utils";
import { ExtraDuty, WorkerInfo } from "../../../structs";
import { Day } from "../../../structs/day";
import { AssignmentRule } from "../assignment-rule";

export class FreeWeekendAssignmentRule implements AssignmentRule {
  protected _seekPrevWeekday(day: Day, weekday: DayOfWeek): Day {
    const currentWeekday = day.getWeekDay() as number;
    const calculatedWeekday = currentWeekday <= weekday ? currentWeekday + 7 : currentWeekday;
    const distance = calculatedWeekday - weekday;
    
    return day.prev(distance);
  }

  protected _hasOrdinaryOnPrevThursdayOrFriday(worker: WorkerInfo, day: Day): boolean {
    const prevFriday = this._seekPrevWeekday(day, DayOfWeek.FRIDAY);
    const prevThursday = prevFriday.prev();
    const currentMonth = worker.daysOfWork.month;
    
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
    if (worker.workTime.duration !== 24) return true;
    
    const isWeekend = duty.day.date.isWeekEnd();
    if (!isWeekend) return true;

    const hasOrdinaryOnPrevThursdayOrFriday = this._hasOrdinaryOnPrevThursdayOrFriday(worker, duty.day.date);

    return !hasOrdinaryOnPrevThursdayOrFriday;
  }
}