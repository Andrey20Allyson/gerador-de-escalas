import { DaysOfWeek } from "@andrey-allyson/escalas-automaticas/dist/utils";
import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

enum DayRestriction {
  NONE = 1,
  ORDINARY_WORK = 2,
  LICENCE = 3
}

const HOURS_PER_DAY = 24;

export class DayRestrictionRule extends EditorRule {
  constructor() {
    super('day-restriction-rule');
  }

  private dutyCollidesWithNextDayLicence(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker } = workerController;
    const { day } = dutyController.duty;
    const nextDayRestriction = worker.restrictions.at(day + 1) ?? DayRestriction.NONE;

    if (nextDayRestriction === DayRestriction.LICENCE) {
      const dutyEnd = dutyController.endsAt();

      if (dutyEnd > HOURS_PER_DAY) return true;
    }

    return false;
  }

  private isDailyWorkerAtFridayNight(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker } = workerController;

    if (
      worker.ordinary.isDailyWorker
      && dutyController.dayOfWeek() === DaysOfWeek.FRIDAY
      && dutyController.startsAt() >= 18
    ) {
      return true;
    }

    return false;
  }

  private testThisDayRestriction(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker } = workerController;
    const { day } = dutyController.duty;
    const restriction = worker.restrictions.at(day) ?? DayRestriction.NONE;

    return restriction === DayRestriction.NONE;
  }

  private testNextDayRestriction(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker } = workerController;
    const { day } = dutyController.duty;
    const restriction = worker.restrictions.at(day + 1) ?? DayRestriction.NONE;

    if (restriction === DayRestriction.ORDINARY_WORK) {
      const dutyTimeOffEnd = dutyController.timeOffEnd();
      const ordinaryStartTime = worker.ordinary.startsAt + HOURS_PER_DAY;

      if (dutyTimeOffEnd > ordinaryStartTime) return false;
    }

    return true;
  }

  private testPrevDayRestriction(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker } = workerController;
    const { day } = dutyController.duty;
    const restriction = worker.restrictions.at(day - 1) ?? DayRestriction.NONE;

    if (restriction === DayRestriction.ORDINARY_WORK) {
      const ordinaryTimeOffEnd = worker.ordinary.timeOffEnd;
      const dutyStartTime = dutyController.startsAt() + HOURS_PER_DAY;

      if (ordinaryTimeOffEnd > dutyStartTime) return false;
    }

    return true;
  }

  protected onTest(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    if (this.dutyCollidesWithNextDayLicence(workerController, dutyController)) return false;

    if (this.isDailyWorkerAtFridayNight(workerController, dutyController)) return true;

    return this.testThisDayRestriction(workerController, dutyController)
      && this.testNextDayRestriction(workerController, dutyController)
      && this.testPrevDayRestriction(workerController, dutyController);
  }
}