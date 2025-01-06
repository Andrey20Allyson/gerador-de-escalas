import { describe, expect, test } from "vitest";
import { OrdinaryAssignmentRule } from "../../extra-duty-lib/builders/rule-checking/rules";
import { mock } from "../mocking/mocker";
import { iterRange } from "../../../utils";
import { WorkTime } from "../../extra-duty-lib/structs/work-time";
import { DaysOfWork } from "../../extra-duty-lib/structs/days-of-work";

interface DutyPositionSizeTestConfig {
  day: number;
  duty: number;
  dutyPositionSize: number;
  result: boolean;
}

describe(OrdinaryAssignmentRule.name, () => {
  const checker = new OrdinaryAssignmentRule();

  test(`Shold return false if duty's day collides with worker's ordinary work day`, () => {
    const { duty, worker } = mock();

    worker.daysOfWork.work(duty.day.index);

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Shold return false if duty collides with worker's ordinary timeoff`, () => {
    const { table, worker } = mock({
      worker: {
        workTime: new WorkTime(1, 18),
      }
    });

    worker.daysOfWork.work(10);

    const day = table.getDay(9);
    const duty = day.getDuty(day.getSize() - 1);

    expect(checker.canAssign(worker, duty))
      .toBeFalsy();
  });

  test(`Should use dutyPositionSize to calculate the time off`, () => {
    const month = mock.month();

    const tests: DutyPositionSizeTestConfig[] = [{
      day: 6,
      duty: 2,
      dutyPositionSize: 2,
      result: false,
    }, {
      day: 6,
      duty: 3,
      dutyPositionSize: 2,
      result: true,
    }, {
      day: 6,
      duty: 2,
      dutyPositionSize: 1,
      result: true,
    }, {
      day: 6,
      duty: 3,
      dutyPositionSize: 3,
      result: false,
    }, {
      day: 4,
      duty: 2,
      dutyPositionSize: 2,
      result: true,
    }, {
      day: 4,
      duty: 3,
      dutyPositionSize: 2,
      result: false,
    }];

    const { table, worker } = mock({
      worker: {
        workTime: new WorkTime(7, 24),
        daysOfWork: DaysOfWork.fromDays([5], month.year, month.index),
      },
      month,
    });

    for (const config of tests) {
      const day = table.getDay(config.day);
      const duty = day.getDuty(config.duty);

      table.config.dutyPositionSize = config.dutyPositionSize;

      expect(checker.canAssign(worker, duty)).toStrictEqual(config.result);
    }
    
  });

  test(`Shold return true if duty don't collides with worker's ordinary`, () => {
    const { table, worker, duty } = mock({
      duty: {
        dayIndex: 17,
      },
    });

    Array.from(iterRange(0, 16))
      .concat(Array.from(iterRange(20, table.width)))
      .forEach(day => worker.daysOfWork.work(day));

    expect(checker.canAssign(worker, duty))
      .toBeTruthy();
  });
});