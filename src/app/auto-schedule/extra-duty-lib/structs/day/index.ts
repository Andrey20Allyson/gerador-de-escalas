import { DayOfWeek, dayOfWeekFrom, getNumOfDaysInMonth, isInteger, isWeekEnd, thisMonth, thisYear } from "../../../utils";
import { Month } from "../month";

export class Day {
  private readonly _month: Month;
  private _weekDay: number | null = null;

  constructor(
    year: number,
    month: number,
    readonly index: number,
  ) {
    this._month = new Month(year, month);

    if (!Day.isValidIndex(this.year, this.month, this.index)) {
      throw new Error(`value ${this.index} don't is a valid day of month ${this._month.toString()}`);
    }
  }

  get year() {
    return this._month.year;
  }

  get month() {
    return this._month.index;
  }

  isBefore(other: Day): boolean {
    if (this.year > other.year) {
      return false;
    }

    if (this.month > other.month) {
      return false;
    }

    return this.index < other.index;
  }

  isAfter(other: Day): boolean {
    if (this.year < other.year) {
      return false;
    }

    if (this.month < other.month) {
      return false;
    }

    return this.index > other.index;
  }

  sumIndex(days: number): Day {
    return new Day(
      this.year,
      this.month,
      this.index + days,
    );
  }

  subIndex(days: number): Day {
    return new Day(
      this.year,
      this.month,
      this.index - days,
    );
  }

  getWeekDay(): DayOfWeek {
    let weekDay = this._weekDay;
    if (weekDay === null) return this._weekDay = dayOfWeekFrom(this._month.getFirstMonday(), this.index);

    return weekDay;
  }

  isWeekEnd(): boolean {
    return isWeekEnd(this.getWeekDay());
  }

  toString(): string {
    const day = this.index + 1;
    const month = this.month + 1;

    const formattedDay = day.toString().padStart(2, '0');
    const formattedMonth = month.toString().padStart(2, '0');
    const formattedYear = this.year.toString();
    
    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  }

  prev(offset: number = 1): Day {
    const { year, month } = this;
    const prevIndex = this.index - offset;

    if (prevIndex >= 0) {
      return new Day(year, month, prevIndex);
    }

    return Day.calculate(year, month, prevIndex);
  }

  next(offset: number = 1): Day {
    const { year, month } = this;
    const nextIndex = this.index + offset;
    const lastIndex = this._month.getNumOfDays() - 1;

    if (nextIndex <= lastIndex) {
      return new Day(year, month, nextIndex);
    }

    return Day.calculate(year, month, nextIndex);
  }

  equalsTo(day: Day) {
    return this.index === day.index &&
      this.month === day.month &&
      this.year === day.year;
  }

  static fromDate(date: Date) {
    return new Day(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() - 1,
    );
  }

  static calculate(year: number, month: number, index: number): Day {
    if (month < 0 || month > 11) {
      const calculatedMonth = Month.calculate(year, month);
      
      return Day.calculate(calculatedMonth.year, calculatedMonth.index, index);
    }

    const lastIndex = Day.lastOf(year, month);
    
    if (index > lastIndex) {
      return Day.calculate(year, month + 1, index - lastIndex - 1);
    } else if (index < 0) {
      const previousMonthLastIndex = Day.lastOf(year, month - 1);

      return Day.calculate(year, month - 1, index + previousMonthLastIndex + 1);
    }

    return new Day(year, month, index);
  }

  static fromLastOf(year: number, month: number): Day {
    return new Day(
      year,
      month,
      Day.lastOf(year, month),
    );
  }

  static lastOf(year: number, month: number): number {
    return getNumOfDaysInMonth(month, year) - 1;
  }

  static isValidIndex(year: number, month: number, day: number) {
    return isInteger(day) && day >= 0 && day <= Day.lastOf(year, month); 
  }

  static now(): Day {
    return new Day(
      thisYear,
      thisMonth,
      new Date().getDate(),
    );
  }
}

export * from './parser';
