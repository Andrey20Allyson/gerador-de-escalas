import { describe, test, expect } from "vitest";
import { Day } from "../../extra-duty-lib/structs/day";
import { DayOfWeek } from "../../../utils";

interface DaySeekPrevWeekdayTestConfig {
  day: Day;
  weekdayToSeek: DayOfWeek;
  expected: Day;
}

describe(Day, () => {
  describe(Day.prototype.seekPrevWeekday, () => {
    const testConfigs: DaySeekPrevWeekdayTestConfig[] = [
      {
        day: new Day(2024, 7, 14),
        weekdayToSeek: DayOfWeek.SATURDAY,
        expected: new Day(2024, 7, 9),
      },
      {
        day: new Day(2024, 7, 20),
        weekdayToSeek: DayOfWeek.WEDNESDAY,
        expected: new Day(2024, 7, 13),
      },
      {
        day: new Day(2024, 7, 15),
        weekdayToSeek: DayOfWeek.MONDAY,
        expected: new Day(2024, 7, 11),
      },
    ];

    testConfigs.forEach((config) => {
      test(`Should return the previous weekday`, () => {
        const dayFound = config.day.seekPrevWeekday(config.weekdayToSeek);

        expect(dayFound.equalsTo(config.expected)).toBeTruthy();
      });
    });
  });
});
