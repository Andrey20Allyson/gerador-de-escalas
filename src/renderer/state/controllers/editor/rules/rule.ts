import { DutyEditorController } from "../duty";
import { WorkerEditorController } from "../worker";

export abstract class EditorRule {
  private enabled = true;

  constructor(
    private name: string,
  ) { }

  test(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean {
    if (!this.isEnabled()) return true;

    return this.onTest(workerController, dutyController);
  }

  protected abstract onTest(workerController: WorkerEditorController, dutyController: DutyEditorController): boolean

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getName() {
    return this.name;
  }
}