import {
  AllowedInterval,
  WorkerRegistryAllowedIntervalsRule,
} from "../../../persistence/entities/worker-registry";
import { WorkerInfo, ExtraDuty } from "../../../structs";
import { AssignmentRule } from "../assignment-rule";

export class AllowedIntervalAssignmentRule implements AssignmentRule {
  protected _getIntervals(worker: WorkerInfo): AllowedInterval[] | null {
    const rules =
      worker.getRuleStack<WorkerRegistryAllowedIntervalsRule>(
        "allowed-intervals",
      );
    if (rules == null) return null;

    return rules.flatMap((rule) => rule.intervals);
  }

  protected _isHourIntoInterval(
    hour: number,
    interval: AllowedInterval,
  ): boolean {
    const { start, end } = interval;

    if (start > end) {
      return hour >= start || hour <= end;
    }

    return hour >= start && hour <= end;
  }

  canAssign(worker: WorkerInfo, duty: ExtraDuty): boolean {
    const intervals = this._getIntervals(worker);
    if (intervals == null) return true;

    for (const interval of intervals) {
      if (this._isHourIntoInterval(duty.start, interval)) {
        return true;
      }
    }

    return false;
  }
}
