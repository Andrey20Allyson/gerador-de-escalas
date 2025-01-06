import { FreeWeekendAssignmentRule } from "src/lib/builders/rule-checking/rules/free-weekend-rule";
import { DaysOfWork, WorkTime } from "src/lib/structs";
import { Month } from "src/lib/structs/month";
import { describe, expect, test } from "vitest";
import { mock } from "../mocking/mocker";

describe(FreeWeekendAssignmentRule, () => {
  test(`Should block assignment of 24h workers on weekend days if he had ordinary on past thursday or friday`, () => {
    const month = new Month(2024, 7);

    const rule = new FreeWeekendAssignmentRule();

    const { table } = mock({ month });

    const dutyAtSaturday = table.getDay(16).getDuty(1);
    const dutyAtSunday = table.getDay(17).getDuty(1);

    const denitedWorker1 = mock.worker({
      workTime: new WorkTime(7, 24),
      daysOfWork: DaysOfWork.fromDays([14], month),
      table,
    });

    expect(rule.canAssign(denitedWorker1, dutyAtSaturday)).toBeFalsy();
    expect(rule.canAssign(denitedWorker1, dutyAtSunday)).toBeFalsy();

    const denitedWorker2 = mock.worker({
      workTime: new WorkTime(7, 24),
      daysOfWork: DaysOfWork.fromDays([15], month),
      table,
    });

    expect(rule.canAssign(denitedWorker2, dutyAtSaturday)).toBeFalsy();
    expect(rule.canAssign(denitedWorker2, dutyAtSunday)).toBeFalsy();

    const allowedWorker = mock.worker({
      workTime: new WorkTime(7, 24),
      daysOfWork: DaysOfWork.fromDays([9, 13], month),
      table,
    });

    expect(rule.canAssign(allowedWorker, dutyAtSaturday)).toBeTruthy();
    expect(rule.canAssign(allowedWorker, dutyAtSunday)).toBeTruthy();
  });
});
