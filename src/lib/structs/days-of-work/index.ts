import {
  enumerate,
  firstMondayFromYearAndMonth,
  getNumOfDaysInMonth,
  isBusinessDay,
} from "src/utils";
import type { Holidays } from "../holidays";
import type { Clonable } from "../worker-info";
import type { LicenseInterval } from "./license-interval";
import { Month } from "../month";

export class DaySearch {
  constructor(
    public past: number = 0,
    public next: number = 0,
  ) {}

  step() {
    this.past--;
    this.next++;
  }

  static fromDay(day: number) {
    return new this(day, day);
  }
}

export interface DayOfWork {
  day: number;
  work: boolean;
  restriction: DayRestriction;
}

export enum DayRestriction {
  NONE = 1,
  ORDINARY_WORK,
  LICENCE,
}

export interface DayRestrictionArray
  extends Iterable<DayRestriction>,
    RelativeIndexable<DayRestriction> {
  readonly length: number;
  values(): Iterable<DayRestriction>;
  [k: number]: DayRestriction;
}

export class DaysOfWork implements Clonable<DaysOfWork> {
  private days: DayRestrictionArray;
  private numOfDaysOff: number;

  readonly length: number;

  constructor(
    readonly month: Month,
    startWorking = false,
    readonly isDailyWorker: boolean = false,
  ) {
    const arrayLenth = month.getNumOfDays();

    this.days = new Uint8Array(arrayLenth).fill(
      startWorking ? DayRestriction.ORDINARY_WORK : DayRestriction.NONE,
    );

    this.length = this.days.length;

    this.numOfDaysOff = startWorking ? 0 : this.length;
  }

  clone() {
    const clone = new DaysOfWork(this.month, false, this.isDailyWorker);

    for (let i = 0; i < this.days.length; i++) {
      clone.set(i, this.get(i));
    }

    clone.numOfDaysOff = this.numOfDaysOff;

    return clone;
  }

  getNumOfDaysOff() {
    return this.numOfDaysOff;
  }

  hasDaysOff(): boolean {
    return this.getNumOfDaysOff() > 0;
  }

  dayOff(day: number) {
    this.set(day, DayRestriction.NONE);
  }

  work(day: number) {
    this.set(day, DayRestriction.ORDINARY_WORK);
  }

  license(day: number) {
    this.set(day, DayRestriction.LICENCE);
  }

  free(day: number) {
    this.set(day, DayRestriction.NONE);
  }

  set(day: number, restriction: DayRestriction) {
    if (day < 0 || day >= this.length || this.days[day] === restriction) return;

    this.numOfDaysOff += restriction === DayRestriction.NONE ? 1 : -1;
    this.days[day] = restriction;
  }

  switchDayOfWork(day: number) {
    const currentRestriction = this.get(day);

    let nextRestriction: DayRestriction;

    switch (currentRestriction) {
      case DayRestriction.NONE:
        nextRestriction = DayRestriction.ORDINARY_WORK;
      case DayRestriction.ORDINARY_WORK:
        nextRestriction = DayRestriction.LICENCE;
      case DayRestriction.LICENCE:
        nextRestriction = DayRestriction.NONE;
    }

    this.set(day, nextRestriction);
  }

  *entries(): Iterable<DayOfWork> {
    for (const [day, restriction] of enumerate(this.days)) {
      yield {
        day,
        work: restriction === DayRestriction.ORDINARY_WORK,
        restriction,
      };
    }
  }

  values(): Iterable<DayRestriction> {
    return this.days.values();
  }

  addHolidays(holidays: Holidays, month: number): void {
    const monthHolidays = holidays.get(month);

    for (const holiday of monthHolidays) {
      const day = holiday.day;

      if (day >= 0 && day < this.days.length) {
        this.notWork(day);
      }
    }
  }

  applyLicenseInterval(licenseInterval: LicenseInterval) {
    for (const day of licenseInterval.iterDaysInMonth(
      this.month.year,
      this.month.index,
    )) {
      this.license(day);
    }
  }

  searchClosestDayOff(search: DaySearch): number | undefined {
    if (search.next === search.past && !this.workOn(search.next)) {
      const day = search.next;

      search.step();

      return day;
    }

    while (search.past >= 0 || search.next < this.length) {
      search.step();

      if (search.past >= 0 && !this.workOn(search.past)) return search.past;
      if (search.next < this.length && !this.workOn(search.next))
        return search.next;
    }
  }

  notWork(day: number): void {
    if (this.dayIs(day, DayRestriction.ORDINARY_WORK))
      this.set(day, DayRestriction.NONE);
  }

  dayIs(day: number, restriction: DayRestriction): boolean {
    return this.get(day) === restriction;
  }

  workOn(day: number): boolean {
    return this.dayIs(day, DayRestriction.ORDINARY_WORK);
  }

  licenseOn(day: number): boolean {
    return this.dayIs(day, DayRestriction.LICENCE);
  }

  get(day: number) {
    return this.days.at(day) ?? DayRestriction.NONE;
  }

  static fromAllDays(month: Month) {
    return new this(month, true);
  }

  static fromDays(days: number[], month: Month): DaysOfWork {
    const daysOfWork = new this(month);

    for (const day of days) {
      daysOfWork.work(day);
    }

    return daysOfWork;
  }

  static fromRestrictionArray(
    restrictions: DayRestriction[],
    month: Month,
  ): DaysOfWork {
    const daysOfWork = new this(month);

    if (restrictions.length !== daysOfWork.length) {
      throw new Error(
        `Invalid input, restrictions array must be the same size of number of days in that month`,
      );
    }

    for (let i = 0; i < daysOfWork.length; i++) {
      daysOfWork.set(i, restrictions[i]!);
    }

    return daysOfWork;
  }

  static fromDailyWorker(month: Month) {
    const daysInThisMonth = month.getNumOfDays();
    const daysOfWork = new this(month, false, true);

    const firstMonday = month.getFirstMonday();

    for (let i = 0; i < daysInThisMonth; i++) {
      if (isBusinessDay(firstMonday, i)) {
        daysOfWork.work(i);
      }
    }

    return daysOfWork;
  }
}

export * from "./parser";
