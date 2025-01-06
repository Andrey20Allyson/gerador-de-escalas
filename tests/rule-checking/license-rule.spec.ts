import { LicenseAssignmentRule } from "src/lib/builders/rule-checking/rules";
import { DaysOfWork } from "src/lib/structs";
import { LicenseInterval } from "src/lib/structs/days-of-work/license-interval";
import { describe, expect, test } from "vitest";
import { mock } from "../mocking/mocker";

describe(LicenseAssignmentRule.name, () => {
  const checker = new LicenseAssignmentRule();

  test(`Shold return false if worker has at license at same day of duty`, () => {
    const { duty, table } = mock();
    const { month } = duty.config;

    const worker = mock.worker({
      daysOfWork: new DaysOfWork(month, false, false),
      table,
    });

    worker.daysOfWork.applyLicenseInterval(
      new LicenseInterval(null, month.getLastDay()),
    );

    expect(checker.canAssign(worker, duty)).toBeFalsy();
  });

  test(`Shold return true if duty don't collides with worker license`, () => {
    const { duty, table } = mock({
      duty: {
        dayIndex: 12,
      },
    });

    const { month } = duty.config;

    const worker = mock.worker({
      daysOfWork: new DaysOfWork(month, false, false),
      table,
    });

    worker.daysOfWork.applyLicenseInterval(
      new LicenseInterval(null, month.getDay(10)),
    );

    expect(checker.canAssign(worker, duty)).toBeTruthy();
  });
});
