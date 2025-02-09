import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { AssignmentInvalidation, EditorRule } from "../rule";

export class GenderRule extends EditorRule {
  constructor() {
    super("gender-rule");
  }

  protected onCheckForInvalidations(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): AssignmentInvalidation | null {
    if (workerController.worker.gender === "male") {
      return null;
    }

    const dutyHasSomeMale = dutyController
      .workers()
      .some((worker) => worker.gender === "male");

    if (dutyHasSomeMale) {
      return null;
    }

    return new AssignmentInvalidation(
      "Turno necessita de pelomenos 1 agente homem para inserir agentes mulheres",
    );
  }
}
