import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { AssignmentInvalidation, EditorRule } from "../rule";

export class WorkerCapacityRule extends EditorRule {
  constructor() {
    super("worker-capacity-rule");
  }

  protected onCheckForInvalidations(
    workerController: WorkerEditorController,
    _: DutyEditorController,
  ): AssignmentInvalidation | null {
    if (
      workerController.dutyQuantity() <
      workerController.table.config.workerCapacity
    ) {
      return null;
    }

    return new AssignmentInvalidation(`Agente chegou no limite de turnos`);
  }
}
