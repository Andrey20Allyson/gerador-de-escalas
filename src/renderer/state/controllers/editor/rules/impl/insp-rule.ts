import { DutyEditorController } from "../../duty-editor";
import { WorkerEditorController } from "../../worker-editor";
import { EditorRule } from "../rule";

export class InspRule extends EditorRule {
  constructor() {
    super('insp-rule');
  }

  protected onTest(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    const { worker } = workerController;

    if (worker.graduation !== 'insp') return true;

    const dutyHasAInsp = dutyController
      .workers()
      .some(worker => worker.graduation === 'insp');

    return dutyHasAInsp === false;
  }
}