import { DaysOfWork } from ".";
import { LicenseInterval } from "./license-interval";

export interface DaysOfWorkParseData {
  name?: string;
  hourly: string;
  post: string;
  year: number;
  month: number;
  license?: LicenseInterval | null;
}

export interface PeriodicParsingOptions {
  daySeparator?: string;
}

export interface PeriodicParsingConfig {
  daySeparator: string;
}

export interface DaysOfWorkParserConfig {
  daysOfWorkRegExp?: RegExp;
  periodic?: PeriodicParsingOptions;
}

export interface IDaysOfWorkParser {
  parse(data: DaysOfWorkParseData): DaysOfWork;
}

export const DEFAULT_DAYS_OF_WORK_REGEXP = /\(DIAS:[^\d]*([^]*)\)/;

export class DaysOfWorkParser implements IDaysOfWorkParser {
  readonly daysOfWorkRegExp: RegExp;
  readonly periodic: PeriodicParsingConfig;

  constructor(config: DaysOfWorkParserConfig = {}) {
    this.daysOfWorkRegExp =
      config.daysOfWorkRegExp ?? DEFAULT_DAYS_OF_WORK_REGEXP;
    this.periodic = {
      daySeparator: config.periodic?.daySeparator ?? ",",
    };
  }

  parse(data: DaysOfWorkParseData): DaysOfWork {
    const { hourly, month, year, license } = data;

    if (license != null) {
      const daysOfWork = DaysOfWork.fromDailyWorker(year, month);

      daysOfWork.applyLicenseInterval(license);

      return daysOfWork;
    }

    const daysOfWork = this.isDailyWorker(hourly)
      ? DaysOfWork.fromDailyWorker(year, month)
      : this.parsePeriodic(data);

    return daysOfWork;
  }

  isDailyWorker(hourly: string) {
    return hourly.includes("2ª/6ª");
  }

  parsePeriodic(data: DaysOfWorkParseData): DaysOfWork {
    const { name = "unknown", hourly, year, month } = data;

    const matches = this.daysOfWorkRegExp.exec(hourly);
    if (!matches) {
      throw new Error(this.getErrorMessage(name, hourly));
    }

    const numbersString = matches.at(1);
    if (!numbersString) {
      throw new Error(this.getErrorMessage(name, hourly));
    }

    const days = numbersString
      .split(this.periodic.daySeparator)
      .map((val) => this.parseToNumber(val) - 1);

    return DaysOfWork.fromDays(days, year, month);
  }

  parseToNumber(value: string): number {
    const num = Number(value);
    if (isNaN(num))
      throw new Error(
        `Can't parse string ${JSON.stringify(value)} to a number!`,
      );

    return num;
  }

  getErrorMessage(name: string, hourly: string) {
    const sep = this.periodic.daySeparator;

    return `Hourly of "${name}" don't matches with format, expected "(DIAS: X${sep}X${sep}X${sep}...${sep}X)" but recived "${hourly}"`;
  }
}

export const DEFAULT_DAYS_OF_WORK_PARSER = new DaysOfWorkParser();
