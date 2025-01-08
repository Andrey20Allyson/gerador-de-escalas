import { DaysOfWork, Month } from "src/lib/structs";
export interface RandomDaysOfWorkOptions {
  /**
   * @default new Month(2023, 0)
   */
  month?: Month;
  /**
   * @default .2
   */
  dailyWorkerRate?: number;
}

const DAYS_1 = [3, 4, 7, 8, 9, 12, 13, 17, 18, 21, 22, 23, 26, 27, 31];
const DAYS_2 = [1, 2, 5, 6, 10, 11, 14, 15, 16, 19, 20, 24, 25, 28, 29, 30];

export function randomDaysOfWork(options: RandomDaysOfWorkOptions = {}) {
  const { month = new Month(2023, 0), dailyWorkerRate = 0.2 } = options;

  const choice = Math.random();

  if (choice < dailyWorkerRate) return DaysOfWork.fromDailyWorker(month);

  if (choice < dailyWorkerRate + (1 - dailyWorkerRate) / 2)
    return DaysOfWork.fromDays(DAYS_1, month);

  return DaysOfWork.fromDays(DAYS_2, month);
}
