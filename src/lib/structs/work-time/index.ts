import { Clonable } from "../worker-info";

export class WorkTime implements Clonable<WorkTime> {
  readonly end: number;
  readonly offTimeEnd: number;

  constructor(
    readonly start: number,
    readonly duration: number,
  ) {
    this.end = this.start + this.duration;
    this.offTimeEnd = this.end + this.duration;
  }

  clone() {
    return new WorkTime(this.start, this.duration);
  }

  equals(workTime: WorkTime) {
    return this.start === workTime.start
      && this.duration === workTime.duration;
  }

  static fromRange(start: number, end: number): WorkTime {
    if (end > start) {
      return new WorkTime(
        start,
        end - start,
      );
    }

    return new WorkTime(
      start,
      24 + end - start,
    );
  }

  static fromDailyWorker() {
    return WorkTime.fromRange(7, 16);
  }
}