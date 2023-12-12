import { DutyEditorController } from "../../duty";
import { WorkerEditorController } from "../../worker";
import { EditorRule } from "../rule";

export class DutyCapacityRule extends EditorRule {
  constructor() {
    super('duty-capacity-rule');
  }

  protected onTest(_: WorkerEditorController, dutyController: DutyEditorController): boolean {
    return dutyController.size() < dutyController.table.config.dutyCapacity;
  }
}