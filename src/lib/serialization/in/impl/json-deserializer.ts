import {
  DaysOfWork,
  ExtraDutyTable,
  ExtraDutyTableConfig,
  WorkerInfo,
  WorkLimit,
  WorkTime,
  Month,
  WorkerIdentifier,
} from "src/lib/structs";
import { DeserializationResult, Deserializer } from "src/lib/serialization/in";
import { resolveProto } from "src/utils/resolve-proto";
import "src/lib/protos";
import { ScheduleFileInfo } from "../..";

export class JsonDeserializer implements Deserializer {
  async deserialize(buffer: Buffer): Promise<DeserializationResult> {
    const parseable = buffer.toString("utf-8");
    const json = JSON.parse(parseable);

    const tableConfig: ExtraDutyTableConfig = {
      ...resolveProto(json.meta),
      extraEvents: {},
    };

    const table = new ExtraDutyTable(tableConfig);

    const workers = (json.workers as any[]).map((worker) =>
      this._objectIntoWorker(worker, table.month),
    );

    table.addWorkers(workers);

    this._applyScheduleObject(json.schedule, table, workers);

    const fileInfo = json.fileInfo as ScheduleFileInfo;

    return { schedule: table, fileInfo };
  }

  protected _objectIntoWorker(object: any, month: Month): WorkerInfo {
    const identifier = new WorkerIdentifier(object.preId, object.postId);

    const daysOfWork = DaysOfWork.fromRestrictionArray(
      object.ordinaryDays,
      month,
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
