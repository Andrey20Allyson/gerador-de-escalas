import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class DutyMinDistanceRule extends EditorRule {
  constructor() {
    super("duty-min-distance-rule");
  }

  protected onTest(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): boolean {
    const minDistance = workerController.dutyMinDistance();

    return workerController
      .duties()
      .every(
        (workerDuty) => dutyController.distanceTo(workerDuty) > minDistance,
      );
  }
}
