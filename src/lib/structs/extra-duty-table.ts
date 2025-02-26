import { DayOfExtraDuty, ExtraDuty, WorkerInfo } from ".";
import { DayOfWeek, thisMonth, thisYear } from "src/utils";
import { ExtraEventName } from "./extra-events/extra-place";
import { Month } from "./month";
import { PositionLimiter } from "./position-limiter";
import {
  ExtraEventConfig,
  ExtraEventConfigBuilder,
} from "./extra-events/extra-event-config";
import { Day } from "./day";
import _ from "lodash";

export interface ExtraDutyTableConfig {
  readonly dutyDuration: number;
  readonly firstDutyTime: number;
  readonly month: Month;
  readonly extraEvents: Record<string, ExtraEventConfig>;
  dutyOffTimeToOrdinary: number;
  dutyPositionSize: number;
  dutyMinDistance: number;
  dutyCapacity: number;
  currentPlace: string;
}

export interface ExtraDutyTableEntry {
  worker: WorkerInfo;
  duty: ExtraDuty;
  day: DayOfExtraDuty;
}

export class ExtraDutyTable implements Iterable<DayOfExtraDuty> {
  private _savedConfig: ExtraDutyTableConfig | null = null;
  readonly days: readonly DayOfExtraDuty[];
  readonly workers: Map<WorkerInfo["id"], WorkerInfo>;
  readonly config: ExtraDutyTableConfig;
  readonly limiter: PositionLimiter;
  readonly width: number;
  readonly month: Month;

  constructor(config?: Partial<ExtraDutyTableConfig>) {
    this.config = ExtraDutyTable.createConfigFrom(config);

    this.month = this.config.month;
    this.width = this.month.getNumOfDays() + 1;
    this.days = DayOfExtraDuty.daysFrom(this);
    this.limiter = new PositionLimiter(this);
    this.workers = new Map();

    this._validateConfig();
  }

  addWorker(worker: WorkerInfo) {
    this.workers.set(worker.id, worker);
  }

  addWorkers(workers: Iterable<WorkerInfo>) {
    for (const worker of workers) {
      this.addWorker(worker);
    }
  }

  getWorkerList() {
    return Array.from(this.workers.values());
  }

  *iterDuties(): Iterable<ExtraDuty> {
    for (const day of this) {
      for (const duty of day) {
        yield duty;
      }
    }
  }

  iterPlaces(): Iterable<string> {
    const placeSet = new Set<string>();

    for (const duty of this.iterDuties()) {
      for (const place of duty.iterPlaces()) {
        placeSet.add(place);
      }
    }

    return placeSet.values();
  }

  findDuty(
    predicate: (duty: ExtraDuty) => boolean,
    start: number = 0,
    end: number = this.width,
  ): ExtraDuty | undefined {
    if (start < 0) start = 0;
    if (end > this.width) end = this.width;

    for (let i = start; i < end; i++) {
      const day = this.getDay(i);

      for (const duty of day) {
        if (predicate(duty) === true) return duty;
      }
    }
  }

  copy(other: ExtraDutyTable) {
    for (const otherDuty of other.iterDuties()) {
      this.getDay(otherDuty.day.index).getDuty(otherDuty.index).copy(otherDuty);
    }

    this.limiter.copy(other.limiter);

    return this;
  }

  clone(): ExtraDutyTable {
    return _.cloneDeep(this);
  }

  [Symbol.iterator](): Iterator<DayOfExtraDuty> {
    return this.days[Symbol.iterator]();
  }

  *entries(): Iterable<ExtraDutyTableEntry> {
    for (const day of this) {
      for (const duty of day) {
        for (const [_, worker] of duty) {
          yield { worker, duty, day };
        }
      }
    }
  }

  clear(place?: string) {
    for (const day of this) {
      day.clear(place);
    }

    this.limiter.clear(place);
  }

  getDay(day: number): DayOfExtraDuty {
    return this.days.at(day) ?? new DayOfExtraDuty(day, this);
  }

  findDay(date: Day): DayOfExtraDuty | undefined {
    return this.days.find((dutyDay) => dutyDay.date.equalsTo(date));
  }

  getDuty(dayIndex: number, dutyIndex: number): ExtraDuty {
    return this.getDay(dayIndex).getDuty(dutyIndex);
  }

  private _validateConfig() {
    if (24 % this.config.dutyDuration !== 0) {
      throw new Error(`dutyDuration shold be a number divisor of 24`);
    }
  }

  saveConfig(): void {
    this._savedConfig = { ...this.config };
  }

  restoreConfig(): void {
    if (this._savedConfig === null) return;

    this.config.dutyOffTimeToOrdinary = this._savedConfig.dutyOffTimeToOrdinary;
    this.config.dutyPositionSize = this._savedConfig.dutyPositionSize;
    this.config.dutyMinDistance = this._savedConfig.dutyMinDistance;
    this.config.dutyCapacity = this._savedConfig.dutyCapacity;
    this.config.currentPlace = this._savedConfig.currentPlace;
  }

  setDutyCapacity(capacity: number): this {
    this.config.dutyCapacity = capacity;
    return this;
  }

  setCurrentEvent(name: string): this {
    this.config.currentPlace = name;
    return this;
  }

  setDutyMinDistance(distance: number): this {
    this.config.dutyMinDistance = distance;
    return this;
  }

  static createConfigFrom(
    partialConfig?: Partial<ExtraDutyTableConfig>,
  ): ExtraDutyTableConfig {
    return {
      dutyPositionSize: partialConfig?.dutyPositionSize ?? 1,
      dutyMinDistance: partialConfig?.dutyMinDistance ?? 6,
      firstDutyTime: partialConfig?.firstDutyTime ?? 1,
      dutyDuration: partialConfig?.dutyDuration ?? 6,
      dutyOffTimeToOrdinary: partialConfig?.dutyOffTimeToOrdinary ?? 12,
      dutyCapacity: partialConfig?.dutyCapacity ?? 2,
      month: partialConfig?.month ?? Month.now(),
      extraEvents: {
        [ExtraEventName.JARDIM_BOTANICO_DAYTIME]:
          ExtraEventConfigBuilder.default({
            allowNighttime: false,
            eventStartDay: new Day(2024, 0, 4),
          }),
        [ExtraEventName.SUPPORT_TO_CITY_HALL]: ExtraEventConfigBuilder.default({
          allowDaytime: false,
          allowedWeekdays: [
            DayOfWeek.FRIDAY,
            DayOfWeek.SATURDAY,
            DayOfWeek.SUNDAY,
          ],
          eventStartDay: new Day(2024, 0, 11),
        }),
        ...partialConfig?.extraEvents,
      },
      currentPlace: partialConfig?.currentPlace ?? ExtraEventName.JIQUIA,
    };
  }
}
