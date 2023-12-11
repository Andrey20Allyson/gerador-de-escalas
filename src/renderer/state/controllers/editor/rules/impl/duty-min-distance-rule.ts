import { DutyData } from "../../../../../../app/api/table-reactive-edition/table";
import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class DutyMinDistanceRule extends EditorRule {
  constructor() {
    super('duty-min-distance-rule');
  }

  protected onTest(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker, table } = workerController;

    const minDistance = worker.ordinary.isDailyWorker ? 1 : table.config.dutyMinDistance;

    return workerController
      .duties()
      .every(workerDuty => dutyController.distanceTo(workerDuty) > minDistance);
  }
}