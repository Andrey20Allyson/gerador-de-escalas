import { WorkerInfo, WorkerInfoConfig } from "../../extra-duty-lib/structs/worker-info";
import { WorkTime } from "../../extra-duty-lib/structs/work-time";
import { ExtraDutyTable, ExtraDutyTableConfig } from "../../extra-duty-lib/structs/extra-duty-table";
import { DaysOfWork } from '../../extra-duty-lib/structs/days-of-work';
import { Month } from "../../extra-duty-lib/structs/month";
import { WorkerIdentifier } from "../../extra-duty-lib/structs/worker-identifier";
import { getYear } from "../../utils";

export interface DutyMockOptions {
  dayIndex?: number,
  dutyIndex?: number,
}

export interface WorkerMockOptions extends Partial<WorkerInfoConfig> {
  month?: Month;
}

export interface WorkerAndDutyMockOptions {
  month?: Month;
  table?: Partial<ExtraDutyTableConfig>;
  worker?: WorkerMockOptions;
  duty?: DutyMockOptions;
}

export function mock(options?: WorkerAndDutyMockOptions) {
  const month = options?.month ?? mock.month();
  const table = new ExtraDutyTable({ month: month.index, year: month.year, ...options?.table });

  const duty = table
    .getDay(options?.duty?.dayIndex ?? 0)
    .getDuty(options?.duty?.dutyIndex ?? 0);

  const worker = mock.worker({
    month: new Month(
      table.config.year,
      table.config.month,
    ),
    ...options?.worker
  });

  return { table, duty, worker, month };
}

export module mock {
  let workerIdCount = 1;

  export function month(): Month {
    return new Month(
      getYear(),
      0,
    );
  }

  export function worker(options?: WorkerMockOptions): WorkerInfo {
    const month = options?.month ?? mock.month();

    return new WorkerInfo({
      name: 'John Due',
      post: 'N/A',
      graduation: 'gcm',
      identifier: new WorkerIdentifier(workerIdCount++, 0),
      individualId: 0,
      gender: 'N/A',
      workTime: new WorkTime(7, 12),
      daysOfWork: DaysOfWork.fromDays([], month.year, month.index),
      ...options,
    });
  }
}