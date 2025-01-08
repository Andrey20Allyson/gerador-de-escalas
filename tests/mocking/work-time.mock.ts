import { WorkTime } from "src/lib/structs";

export interface WorkTimeParseTestEntry {
  input: string;
  expectedResult: WorkTime;
}

export const WORK_TIME_PARSE_TESTS: WorkTimeParseTestEntry[] = [
  {
    input: "07 ÀS 16h 2ª/6ª ..",
    expectedResult: WorkTime.fromRange(7, 18),
  },
  {
    input: "12 ÀS 21h 2ª/6ª",
    expectedResult: WorkTime.fromRange(12, 21),
  },
  {
    input: "07 ÀS 16h 2ª/6ª",
    expectedResult: WorkTime.fromRange(7, 16),
  },
  {
    input: "01 ÀS 22h.. 2ª/6ª",
    expectedResult: WorkTime.fromRange(1, 24),
  },
  {
    input: "09 ÀS 09h 2ª/6ª .",
    expectedResult: WorkTime.fromRange(9, 10),
  },
  {
    input: "19 ÀS 07h",
    expectedResult: WorkTime.fromRange(19, 7),
  },
  {
    input: "07 ÀS 19h",
    expectedResult: WorkTime.fromRange(7, 19),
  },
];
