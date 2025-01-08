import { WorkerInfo, WorkerInfoConfig } from "src/lib/structs/worker-info";
import { WorkTime } from "src/lib/structs/work-time";
import {
  ExtraDutyTable,
  ExtraDutyTableConfig,
} from "src/lib/structs/extra-duty-table";
import { DaysOfWork } from "src/lib/structs/days-of-work";
import { Month } from "src/lib/structs/month";
import { WorkerIdentifier } from "src/lib/structs/worker-identifier";
import { getYear } from "src/utils";

export interface DutyMockOptions {
  dayIndex?: number;
  dutyIndex?: number;
}

export interface WorkerMockOptions extends Partial<WorkerInfoConfig> {
  month?: Month;
  table: ExtraDutyTable;
}

export interface WorkerAndDutyMockOptions {
  month?: Month;
  table?: Partial<ExtraDutyTableConfig>;
  worker?: Omit<WorkerMockOptions, "table">;
  duty?: DutyMockOptions;
}

export function mock(options?: WorkerAndDutyMockOptions) {
  const month = options?.month ?? mock.month();
  const table = new ExtraDutyTable({
    month,
    ...options?.table,
  });

  const duty = table
    .getDay(options?.duty?.dayIndex ?? 0)
    .getDuty(options?.duty?.dutyIndex ?? 0);

  const worker = mock.worker({
    month: table.month,
    table,
    ...options?.worker,
  });

  return { table, duty, worker, month };
}

export module mock {
  let workerIdCount = 1;

  export function month(): Month {
    return new Month(getYear(), 0);
  }

  export function worker(options: WorkerMockOptions): WorkerInfo {
    const month = options?.month ?? mock.month();

    const worker = new WorkerInfo({
      name: "John Due",
      post: "N/A",
      graduation: "gcm",
      identifier: new WorkerIdentifier(workerIdCount++, 0),
      individualId: 0,
      gender: "N/A",
      workTime: new WorkTime(7, 12),
      daysOfWork: DaysOfWork.fromDays([], month),
      ...options,
    });

    options.table.addWorker(worker);

    return worker;
  }
}
