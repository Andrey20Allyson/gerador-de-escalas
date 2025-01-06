import { WorkerInfo } from "../../../../extra-duty-lib";
import { Day } from "../../../../extra-duty-lib/structs/day";

export class WorkerDuty {
  constructor(
    readonly worker: WorkerInfo,
    readonly start: number,
    public end: number,
    readonly date: Day,
  ) {}

  compare(other: WorkerDuty) {
    if (this.date.isBefore(other.date)) {
      return -1;
    }

    if (this.date.isAfter(other.date)) {
      return 1;
    }

    if (this.start < other.start) {
      return -1;
    }

    if (this.start > other.start) {
      return 1;
    }

    return 0;
  }
}
