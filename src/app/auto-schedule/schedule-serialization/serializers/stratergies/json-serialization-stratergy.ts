import { ExtraDutyTable, ExtraDutyTableEntry, WorkerInfo } from "../../../extra-duty-lib";
import { SerializationStratergy } from "../serialization-stratergy";

export class JsonSerializationStratergy implements SerializationStratergy {
  async execute(table: ExtraDutyTable): Promise<Buffer> {
    const workers = table
      .workers()
      .map(worker => this._workerIntoObject(worker));

    const schedule = Array.from(table.entries())
      .map(entry => this._extraDutyTableEntryIntoObject(entry));

    const object = {
      meta: table.config,
      workers,
      schedule,
    };

    const json = JSON.stringify(object);
    const buffer = Buffer.from(json);

    return buffer;
  }

  protected _workerIntoObject(worker: WorkerInfo) {
    return {
      id: worker.identifier.id,
      preId: worker.identifier.preId,
      postId: worker.identifier.postId,
      individualId: worker.config.individualId,
      name: worker.name,
      post: worker.config.post,
      graduation: worker.graduation,
      gender: worker.gender,
      ordinaryDays: Array.from(worker.daysOfWork.values()),
      ordinaryStartHour: worker.workTime.start,
      ordinaryDurationHour: worker.workTime.duration,
      limits: Array.from(worker.limit.iter()),
    };
  }

  protected _extraDutyTableEntryIntoObject(duty: ExtraDutyTableEntry) {
    return [
      duty.day.index,
      duty.duty.index,
      duty.worker.id,
    ];
  }
}