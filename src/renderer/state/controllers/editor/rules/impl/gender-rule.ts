import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class GenderRule extends EditorRule {
  constructor() {
    super("gender-rule");
  }

  protected onTest(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): boolean {
    if (workerController.worker.gender === "male") return true;

    const dutyHasSomeMale = dutyController
      .workers()
      .some((worker) => worker.gender === "male");

    return dutyHasSomeMale;
  }
}
