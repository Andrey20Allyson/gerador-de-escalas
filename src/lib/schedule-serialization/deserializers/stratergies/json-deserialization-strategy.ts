import {
  DaysOfWork,
  ExtraDutyTable,
  ExtraDutyTableConfig,
  WorkerInfo,
  WorkLimit,
  WorkTime,
} from "../../../extra-duty-lib";
import { Month } from "../../../extra-duty-lib/structs/month";
import { WorkerIdentifier } from "../../../extra-duty-lib/structs/worker-identifier";
import { DeserializationStratergy } from "../deserialization-stratergy";

export class JsonDeserializationStratergy implements DeserializationStratergy {
  async execute(buffer: Buffer): Promise<ExtraDutyTable> {
    const parseable = buffer.toString("utf-8");
    const json = JSON.parse(parseable);

    const tableConfig: ExtraDutyTableConfig = {
      ...json.meta,
      extraEvents: {},
    };

    const table = new ExtraDutyTable(tableConfig);

    const workers = (json.workers as any[]).map((worker) =>
      this._objectIntoWorker(worker, table.month),
    );

    this._applyScheduleObject(json.schedule, table, workers);

    return table;
  }

  protected _objectIntoWorker(object: any, month: Month): WorkerInfo {
    const identifier = new WorkerIdentifier(object.preId, object.postId);

    const daysOfWork = DaysOfWork.fromRestrictionArray(
      object.ordinaryDays,
      month.year,
      month.index,
    );

    const worker = new WorkerInfo({
      identifier,
      individualId: object.individualId,
      name: object.name,
      post: object.post,
      graduation: object.graduation,
      gender: object.gender,
      daysOfWork,
      workTime: new WorkTime(
        object.ordinaryStartHour,
        object.ordinaryDurationHour,
      ),
      limit: new WorkLimit([object.limits]),
    });

    return worker;
  }

  protected _applyScheduleObject(
    schedute: any[],
    table: ExtraDutyTable,
    workers: WorkerInfo[],
  ): void {
    const map = new Map(workers.map((worker) => [worker.id, worker] as const));

    for (const [dayIndex, dutyIndex, workerId] of schedute) {
      const worker = map.get(workerId);

      if (worker == null) {
        throw new Error(
          `Invalid Data, worker with id '${workerId}' hasn't declarated`,
        );
      }

      table.getDuty(dayIndex, dutyIndex).add(worker);
    }
  }
}
