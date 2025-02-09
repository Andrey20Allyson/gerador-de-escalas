import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { AssignmentInvalidation, EditorRule } from "../rule";

export class InspRule extends EditorRule {
  constructor() {
    super("insp-rule");
  }

  protected onCheckForInvalidations(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): AssignmentInvalidation | null {
    const { worker } = workerController;

    if (worker.graduation !== "insp") {
      return null;
    }

    const dutyHasAInsp = dutyController
      .workers()
      .some((worker) => worker.graduation === "insp");

    if (!dutyHasAInsp) {
      return null;
    }

    return new AssignmentInvalidation(
      "Turnos não podem possuir mais de 1 inspetor",
    );
  }
}
