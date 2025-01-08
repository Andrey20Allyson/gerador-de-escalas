import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class InspRule extends EditorRule {
  constructor() {
    super("insp-rule");
  }

  protected onTest(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): boolean {
    const { worker } = workerController;

    if (worker.graduation !== "insp") return true;

    const dutyHasAInsp = dutyController
      .workers()
      .some((worker) => worker.graduation === "insp");

    return dutyHasAInsp === false;
  }
}
