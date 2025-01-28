import { firstMondayFromYearAndMonth, dayOfWeekFrom } from "../../../utils";
import {
  DutyAndWorkerRelationship,
  DutyData,
  ScheduleState,
  WorkerData,
} from "../../../../apploader/api/table-reactive-edition";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { editorActions } from "../../slices/table-editor";
import {
  DispatcherType,
  EditorControllerOptions,
  currentTableFromRootSelector,
} from "./table";
import { DutyFormatter } from "../../formatters/editor/duty";
import { Month } from "src/lib/structs";

export interface IDutyEditor {
  remove(workerId: number): this;
  add(workerId: number): this;
  relationships(): DutyAndWorkerRelationship[];
  size(): number;
  workers(): WorkerData[];
}

export interface DutyEditorControllerOptions extends EditorControllerOptions {}

export class DutyEditorController implements IDutyEditor {
  readonly dispatcher: DispatcherType;
  readonly table: ScheduleState;
  readonly duty: DutyData;
  readonly format: DutyFormatter;

  constructor(dutyId: number);
  constructor(dutyId: number, options: DutyEditorControllerOptions);
  constructor(dutyId: number, options: DutyEditorControllerOptions = {}) {
    const {
      dispatcher = useAppDispatch(),
      table = useAppSelector(currentTableFromRootSelector),
    } = options;

    this.table = table;
    this.dispatcher = dispatcher;

    const duty = this.table.duties.find((duty) => duty.id === dutyId);
    if (duty === undefined)
      throw new Error(`Duty with id ${dutyId} can't be found!`);

    this.duty = duty;

    this.format = new DutyFormatter(table, duty);
  }

  remove(workerId: number): this {
    const foundRelationship = this.table.dutyAndWorkerRelationships.find(
      (relationship) => {
        return (
          relationship.workerId === workerId &&
          relationship.dutyId === this.duty.id
        );
      },
    );
    if (foundRelationship === undefined) return this;

    this.dispatcher(
      editorActions.removeRelationship({ id: foundRelationship.id }),
    );

    return this;
  }

  add(workerId: number): this {
    const alreadyHasHelationship = this.table.dutyAndWorkerRelationships.some(
      (relationship) => {
        return (
          relationship.dutyId === this.duty.id &&
          relationship.workerId === workerId
        );
      },
    );
    if (alreadyHasHelationship) return this;

    this.dispatcher(
      editorActions.addRelationship({ dutyId: this.duty.id, workerId }),
    );

    return this;
  }

  shift(count: number, startDutyId?: number): DutyEditorController {
    const dutyLimit = this.table.config.dutiesPerDay;
    const numOfDays = this.table.config.numOfDays;
    const dutyIdx = this.duty.index;
    const day = this.duty.date;

    const dayShift = Math.floor((count + dutyIdx) / dutyLimit);

    const nextIdx = (dutyIdx + dutyLimit + (count % dutyLimit)) % dutyLimit;
    const nextDay = (day.index + dayShift + numOfDays) % numOfDays;

    const duty = this.table.duties.find(
      (duty) => duty.date.index === nextDay && duty.index === nextIdx,
    );
    if (!duty)
      throw new Error(
        `Can't find duty at day ${nextDay} in duty index ${nextIdx}`,
      );

    const { table, dispatcher } = this;

    const dutyController = new DutyEditorController(duty.id, {
      table,
      dispatcher,
    });

    if (dutyController.isActive() === false) {
      if (duty.id === startDutyId) {
        throw new Error(`Can't find a active duty`);
      }

      return dutyController.shift(count, duty.id);
    }

    return dutyController;
  }

  dayOfWeek() {
    const { year, month } = this.table.config;
    const { date: day } = this.duty;

    const firstMonday = new Month(year, month).getFirstMonday();

    return dayOfWeekFrom(firstMonday, day.index);
  }

  startsAt() {
    return (
      this.table.config.firstDutyTime +
      this.table.config.dutyDuration * this.duty.index
    );
  }

  endsAt() {
    return this.startsAt() + this.table.config.dutyDuration;
  }

  timeOffEnd() {
    return this.endsAt() + this.table.config.dutyDuration;
  }

  next(count: number = 1) {
    return this.shift(count);
  }

  prev(count: number = 1) {
    return this.shift(-count);
  }

  nextDay(count: number = 1) {
    return this.next(count * 2);
  }

  prevDay(count: number = 1) {
    return this.prev(count * 2);
  }

  relationships(): DutyAndWorkerRelationship[] {
    return this.table.dutyAndWorkerRelationships.filter(
      (relationship) => relationship.dutyId === this.duty.id,
    );
  }

  size(): number {
    return this.relationships().length;
  }

  isActive(): boolean {
    return this.duty.active;
  }

  workerIds(): number[] {
    return this.workers().map((worker) => worker.id);
  }

  workers(): WorkerData[] {
    const workerMap = new Map(
      this.table.workers.map((worker) => [worker.id, worker]),
    );

    return this.relationships().map((relationship) => {
      const worker = workerMap.get(relationship.workerId);
      if (worker === undefined)
        throw new Error(`Can't find worker with id ${relationship.workerId}!`);

      return worker;
    });
  }

  distanceTo(otherDuty: DutyData) {
    const { dutiesPerDay } = this.table.config;
    const duty = this.duty;

    const posA = duty.index + duty.date.index * dutiesPerDay;
    const posB = otherDuty.index + otherDuty.date.index * dutiesPerDay;
    const distance = Math.abs(posA - posB);

    return distance;
  }

  static from(iterable: Iterable<number | DutyData>): DutyEditorController[] {
    const options: DutyEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table: useAppSelector(currentTableFromRootSelector),
    };

    return Array.from(iterable, (value) => {
      const dutyId = typeof value === "number" ? value : value.id;

      return new DutyEditorController(dutyId, options);
    });
  }

  static find(day: number, index: number): DutyData {
    const table = useAppSelector(currentTableFromRootSelector);
    const duty = table.duties.find(
      (duty) => duty.date.index === day && duty.index === index,
    );
    if (!duty)
      throw new Error(`Can't find duty at day ${day} in index ${index}`);

    return duty;
  }

  static all(): DutyEditorController[] {
    const table = useAppSelector(currentTableFromRootSelector);

    const options: DutyEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table,
    };

    return table.duties.map(
      (duty) => new DutyEditorController(duty.id, options),
    );
  }
}
