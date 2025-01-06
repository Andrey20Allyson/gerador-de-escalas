import { WorkerInfo, ExtraDuty } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class DesactivedDutyAssignmentRule implements AssignmentRule {
  canAssign(_worker: WorkerInfo, duty: ExtraDuty): boolean {
    return duty.isActive();
  }
}