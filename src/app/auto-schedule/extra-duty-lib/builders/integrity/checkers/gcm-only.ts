import { TableIntegrity } from "../table-integrity";
import { IntegrityWarning } from "../inconsistences/warning";
import { IntegrityChecker } from "./integrity-checker";

export class GCMOnlyChecker implements IntegrityChecker {
  constructor(
    public penality: number = 5000,
  ) { }

  check(integrity: TableIntegrity): void {
    let numOfGraduatePair = 0;
    let numOfDutiesGCMOnly = 0;

    for (const duty of integrity.table.iterDuties()) {
      if (duty.gradIsOnly('gcm')) numOfDutiesGCMOnly++;

      if (duty.graduateQuantity() >= 2) numOfGraduatePair++;
    }

    if (numOfDutiesGCMOnly > 0) {
      const warning = new IntegrityWarning('gcm only duty', numOfGraduatePair * this.penality);
      warning.accumulate = numOfDutiesGCMOnly;

      integrity.registry(warning);
    }
  }
}