import { DutyEditorController } from "../duty";
import { WorkerEditorController } from "../worker";

export class AssignmentInvalidation {
  constructor(
    readonly message: string,
    readonly causes: AssignmentInvalidation[] = [],
  ) {}

  addCause(cause: AssignmentInvalidation) {
    this.causes.push(cause);
  }

  hasAnyCause(): boolean {
    return this.causes.length > 0;
  }
}

export abstract class EditorRule {
  private enabled = true;

  constructor(private name: string) {}

  checkForInvalidations(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): AssignmentInvalidation | null {
    if (!this.isEnabled()) return null;

    return this.onCheckForInvalidations(workerController, dutyController);
  }

  protected abstract onCheckForInvalidations(
    workerController: WorkerEditorController,
    dutyController: DutyEditorController,
  ): AssignmentInvalidation | null;

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
