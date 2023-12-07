import { DaysOfWeek } from "@andrey-allyson/escalas-automaticas/dist/utils";
import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

enum DayRestriction {
  NONE = 1,
  ORDINARY_WORK = 2,
  LICENCE = 3
}

export class DayRestrictionRule extends EditorRule {
  constructor() {
    super('day-restriction-rule');
  }

  protected onTest(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { duty: { day, index: dutyIndex } } = dutyController;
    const { worker, table } = workerController;
    const { dutiesPerDay } = table.config;
    const { ordinary } = worker;

    const thisDayRestriction = worker.restrictions.at(day) ?? DayRestriction.NONE;

    if (thisDayRestriction !== DayRestriction.NONE) {
      if (thisDayRestriction === DayRestriction.LICENCE) return false;
      
      if (ordinary.isDailyWorker && dutyController.dayOfWeek() === DaysOfWeek.FRIDAY) return true;
    }

    const nextDayRestriction = worker.restrictions.at(day + 1) ?? DayRestriction.NONE;

    if (nextDayRestriction === DayRestriction.LICENCE && dutyIndex + 1 === dutiesPerDay) return false;
    if (nextDayRestriction === DayRestriction.ORDINARY_WORK) {
      const dutyTimeOffEnd = dutyController.timeOffEnd();
      const ordinaryStartTime = ordinary.startsAt + 24;

      if (dutyTimeOffEnd > ordinaryStartTime) return false;
    }

    const prevDayRestriction = worker.restrictions.at(day - 1) ?? DayRestriction.NONE;

    if (prevDayRestriction === DayRestriction.ORDINARY_WORK) {
      const ordinaryTimeOffEnd = ordinary.endsAt + ordinary.duration;
      const dutyStartTime = dutyController.startsAt();

      if (ordinaryTimeOffEnd > dutyStartTime) return false;
    }

    return true;
  }
}