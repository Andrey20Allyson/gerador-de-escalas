import {
  ExtraDutyTable,
  ExtraDutyTableEntry,
  WorkerInfo,
} from "src/lib/structs";
import { Serializer } from "../serializer";
import { cloneAndInscribeProto } from "src/utils/resolve-proto";
import "src/lib/protos";

export class JsonSerializationStratergy implements Serializer {
  async serialize(table: ExtraDutyTable): Promise<Buffer> {
    const workers = Array.from(table.workers.values(), (worker) => {
      return this._workerIntoObject(worker);
    });

    const schedule = Array.from(table.entries()).map((entry) =>
      this._extraDutyTableEntryIntoObject(entry),
    );

    const object = {
      meta: cloneAndInscribeProto(table.config),
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
    return [duty.day.index, duty.duty.index, duty.worker.id];
  }
}
