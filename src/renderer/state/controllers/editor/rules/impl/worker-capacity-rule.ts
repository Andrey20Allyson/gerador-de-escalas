import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class WorkerCapacityRule extends EditorRule {
  constructor() {
    super("worker-capacity-rule");
  }

  protected onTest(
    workerController: WorkerEditorController,
    _: DutyEditorController,
  ): boolean {
    return (
      workerController.dutyQuantity() <
      workerController.table.config.workerCapacity
    );
  }
}
