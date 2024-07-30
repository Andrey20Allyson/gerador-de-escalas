import { AllowedInterval, WorkerRegistryAllowedIntervalsRule } from "../../../../persistence/entities/worker-registry";
import { WorkerInfo, ExtraDuty } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class AllowedIntervalAssignmentRule implements AssignmentRule {
  protected _getIntervals(worker: WorkerInfo): AllowedInterval[] | null {
    const rules = worker.getRuleStack<WorkerRegistryAllowedIntervalsRule>('allowed-intervals');
    if (rules == null) return null;

    return rules.flatMap(rule => rule.intervals);
  }
  
  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const intervals = this._getIntervals(worker);
    if (intervals == null) return true;

    for (const interval of intervals) {
      if (duty.start >= interval.start && duty.start <= interval.end) {
        return true;
      }
    }

    return false;
  }
}