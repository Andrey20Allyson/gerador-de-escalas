import { describe, expect, test } from "vitest";
import { DaysOfWorkParser } from "src/lib/structs/days-of-work/parser";
import { Month } from "src/lib/structs/month";
import { iterRange } from "src/utils";
import { createRandomHourly } from "tests/mocking/days-of-work-parser.mock";

function testParsePeriodic(index?: number) {
  const month = Month.now();

  const post = "Unknown";
  const name = "John Due";

  const parser = new DaysOfWorkParser({ periodic: { daySeparator: "," } });
  const mock = createRandomHourly(month);

  const daysOfOrdinarySet = new Set(mock.daysOfOrdinary);

  test(`test #${index} : Shold parse '${mock.text}'`, () => {
    const parsed = parser.parse({ hourly: mock.text, month, post, name });

    for (const dayOfWork of parsed.entries()) {
      if (daysOfOrdinarySet.has(dayOfWork.day)) {
        expect(dayOfWork.work).toBeTruthy();
        continue;
      }

      expect(dayOfWork.work).toBeFalsy();
    }
  });
}

function testErrorOnParsePeriodic(index?: number) {
  const month = Month.now();

  const post = "Unknown";
  const name = "John Due";

  const parser = new DaysOfWorkParser({ periodic: { daySeparator: ";" } });
  const mock = createRandomHourly(month);

  test(`test $${index} : Shold throw`, () => {
    expect(() =>
      parser.parse({ hourly: mock.text, month, post, name }),
    ).toThrow();
  });
}

describe(DaysOfWorkParser.name, () => {
  describe(DaysOfWorkParser.prototype.parsePeriodic.name, () => {
    const NUM_OF_TESTS = 50;

    Array.from(iterRange(0, NUM_OF_TESTS)).forEach(testParsePeriodic);

    testErrorOnParsePeriodic(0);
  });
});
