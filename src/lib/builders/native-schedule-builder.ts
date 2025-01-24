import { ExtraDutyTable, Gender, Graduation } from "../structs";
import { ScheduleBuilder } from "./schedule-builder";
import nativeScheduler from "dist/native/scheduler";

export interface NativeScheduleBuilderOptions {
  tries?: number;
}

export class NativeScheduleBuilder implements ScheduleBuilder {
  constructor(readonly options?: NativeScheduleBuilderOptions) {}

  build(table: ExtraDutyTable): ExtraDutyTable {
    const workers = table.getWorkerList();

    const genderMap: Record<Gender, () => number> = {
      male: () => 1,
      female: () => 2,
      "N/A": () => {
        throw new Error("not defined gender error");
      },
    };
    const gradMap: Record<Graduation, () => number> = {
      insp: () => 1,
      "sub-insp": () => 2,
      gcm: () => 3,
    };

    const result = nativeScheduler.generateSchedule({
      month: {
        year: table.month.year,
        index: table.month.index,
      },
      workers: workers.map((worker) => {
        const workDays: number[] = [];

        for (const { work, day } of worker.daysOfWork.entries()) {
          if (work === true) {
            workDays.push(day);
          }
        }

        return {
          id: worker.id,
          gender: genderMap[worker.gender](),
          grad: gradMap[worker.graduation](),
          ordinaryInfo: {
            workDays,
            isDailyWorker: worker.daysOfWork.isDailyWorker,
            start: worker.workTime.start,
            duration: worker.workTime.duration,
          },
        };
      }),
      qualifier: {
        triesLimit: this.options?.tries ?? 8_000,
      },
    });

    for (const assign of result.assignState) {
      let worker = table.workers.get(assign.workerId);
      if (worker == null) {
        throw new Error(`unknow worker id: ${assign.workerId}`);
      }

      table.getDuty(assign.dayIndex, assign.dutyIndex).add(worker);
    }

    return table;
  }
}
