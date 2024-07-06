import { ExtraDuty } from "../../../structs";
import { ExtraEventConfig } from "../../../structs/extra-events/extra-event-config";
import { ExtraEventAllowedTimeRule } from "../../rule-checking/rules/extra-event-allowed-time-rule";
import { IntegrityWarning } from "../inconsistences/warning";
import { TableIntegrity } from "../table-integrity";
import { IntegrityChecker } from "./integrity-checker";

export class CorrectWorkerAllocationChecker implements IntegrityChecker {
  constructor(
    readonly basePenality: number = 12000,
    readonly extraEventAllowedTimeRule = new ExtraEventAllowedTimeRule(),
  ) { }

  calculatePenality(workerPositionsLeft: number) {
    return this.basePenality * (1.4 * workerPositionsLeft ** 2)
  }

  isWorkerInsuficient(duty: ExtraDuty) {
    if (this.extraEventAllowedTimeRule.canAssign(undefined, duty) === false) return true;

    return duty.getSize() < 2;
  }

  check(integrity: TableIntegrity): void {
    const isWorkerInsuficient = Array.from(integrity.table.iterDuties()).some(duty => this.isWorkerInsuficient(duty));

    if (!isWorkerInsuficient) return;

    for (const worker of integrity.table.workers()) {
      if (worker.daysOfWork.hasDaysOff() === false) continue;

      const penality = this.calculatePenality(integrity.table.limiter.positionsLeftOf(worker));

      integrity.registry(new IntegrityWarning(`workers hasn't correctly allocated`, penality));
    }
  }
}