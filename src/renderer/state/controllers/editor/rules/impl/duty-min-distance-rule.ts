import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { AssignmentInvalidation, EditorRule } from "../rule";

export class DutyMinDistanceRule extends EditorRule {
  constructor() {
    super("duty-min-distance-rule");
  }

  protected onCheckForInvalidations(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): AssignmentInvalidation | null {
    const minDistance = workerController.dutyMinDistance();

    const duties = workerController.duties();
    const invalidation = new AssignmentInvalidation(
      "Turno não respeita o intervalo mínimo de outros turnos",
    );

    for (const duty of duties) {
      if (dutyController.distanceTo(duty) >= minDistance) {
        continue;
      }

      invalidation.addCause(
        new AssignmentInvalidation(
          `Turno ${dutyController.duty.key} não respeita o intervalo mínimo do turno ${duty.key}`,
        ),
      );
    }

    if (!invalidation.hasAnyCause()) {
      return null;
    }

    return invalidation;
  }
}
