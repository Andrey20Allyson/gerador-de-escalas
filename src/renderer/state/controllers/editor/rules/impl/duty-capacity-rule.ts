import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { AssignmentInvalidation, EditorRule } from "../rule";

export class DutyCapacityRule extends EditorRule {
  constructor() {
    super("duty-capacity-rule");
  }

  protected onCheckForInvalidations(
    _: WorkerEditorController,
    dutyController: DutyEditorController,
  ): AssignmentInvalidation | null {
    if (dutyController.size() < dutyController.table.config.dutyCapacity) {
      return null;
    }

    return new AssignmentInvalidation(
      "Turno já possui o número máximo de agentes",
    );
  }
}
