import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class DutyIntervalRule extends EditorRule {
  constructor() {
    super('duty-interval-rule');
  }

  protected onTest(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { dutyInterval, dutiesPerDay } = workerController.table.config;
    const { duty } = dutyController;

    const workerDuties = workerController.duties();

    for (const workerDuty of workerDuties) {
      const distance = Math.abs(workerDuty.index + workerDuty.day * dutiesPerDay - duty.index + duty.day * dutiesPerDay);

      if (distance <= dutyInterval) return false;
    }

    return true;
  }
}