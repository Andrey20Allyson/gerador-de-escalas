import { WorkTime } from ".";
import { LicenseInterval } from "../days-of-work/license-interval";

export interface ParseWorkTimeData {
  readonly name?: string;
  readonly hourly: string;
  readonly license?: LicenseInterval | null;
}

export interface IWorkTimeParser {
  parse(data: ParseWorkTimeData): WorkTime;
}

export const DEFAULT_WORK_TIME_REGEXP = /(\d{2}) ÀS (\d{2})h/;

export class WorkTimeParser implements IWorkTimeParser {
  readonly overtimeIndicator = '.';
  readonly workTimeRegexp = DEFAULT_WORK_TIME_REGEXP;

  parse(data: ParseWorkTimeData): WorkTime {
    const { hourly, name, license } = data;

    if (license != null) {
      return WorkTime.fromDailyWorker();
    }

    const matches = this.workTimeRegexp.exec(hourly);
    if (!matches) throw new Error(`Can't parse workTime of "${name}"`);

    const [_, start, end] = matches as unknown as [string, ...(string | undefined)[]];

    const parsedStart = Number(start);
    const parsedEnd = Number(end) + this.getOvertime(hourly);

    return WorkTime.fromRange(parsedStart, parsedEnd);
  }

  private getOvertime(text: string) {
    if (this.overtimeIndicator.length !== 1) throw new Error(`'overtimeIndicator' only revices a single character`);

    const start = text.indexOf(this.overtimeIndicator);
    let count = 0;

    for (let i = start; ; i++) {
      if (text.at(i) !== this.overtimeIndicator) {
        break;
      }

      count++;
    }

    return count;
  }
}