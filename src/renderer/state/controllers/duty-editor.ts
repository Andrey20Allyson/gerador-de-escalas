import { DutyAndWorkerRelationship, DutyData, TableData, WorkerData } from "../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { editorActions } from "../slices/table-editor";
import { DispatcherType, EditorControllerOptions, currentTableFromRootSelector } from "./table-editor";

export interface IDutyEditor {
  remove(workerId: number): this;
  add(workerId: number): this;
  relationships(): DutyAndWorkerRelationship[];
  size(): number;
  workers(): WorkerData[];
}

export interface DutyEditorControllerOptions extends EditorControllerOptions { }

export class DutyEditorController implements IDutyEditor {
  readonly dispatcher: DispatcherType;
  readonly table: TableData;
  readonly duty: DutyData;

  constructor(dutyId: number);
  constructor(dutyId: number, options: DutyEditorControllerOptions);
  constructor(dutyId: number, options: DutyEditorControllerOptions = {}) {
    const {
      dispatcher = useAppDispatch(),
      table = useAppSelector(currentTableFromRootSelector),
    } = options;

    this.table = table;
    this.dispatcher = dispatcher;

    const duty = this.table.duties.find(duty => duty.id === dutyId);
    if (duty === undefined) throw new Error(`Duty with id ${dutyId} can't be found!`);

    this.duty = duty;
  }

  remove(workerId: number): this {
    const foundRelationship = this.table.dutyAndWorkerRelationships.find(relationship => {
      return relationship.workerId === workerId && relationship.dutyId === this.duty.id;
    });
    if (foundRelationship === undefined) return this;

    this.dispatcher(editorActions.removeRelationship({ id: foundRelationship.id }));

    return this;
  }

  add(workerId: number): this {
    const alreadyHasHelationship = this.table.dutyAndWorkerRelationships.some(relationship => {
      return relationship.dutyId === this.duty.id && relationship.workerId === workerId;
    });
    if (alreadyHasHelationship) return this;

    this.dispatcher(editorActions.addRelationship({ dutyId: this.duty.id, workerId }));

    return this;
  }
  
  shift(count: number) {
    const dutyLimit = this.table.config.dutyCapacity;
    const numOfDays = this.table.config.numOfDays;
    const dutyIdx = this.duty.index;
    const day = this.duty.day;

    const dayShift = Math.floor((count + dutyIdx) / dutyLimit);
    
    const nextIdx = (dutyIdx + dutyLimit + count % dutyLimit) % dutyLimit;
    const nextDay = (day + dayShift + numOfDays) % numOfDays;

    const duty = this.table.duties.find(duty => duty.day === nextDay && duty.index === nextIdx);
    if (!duty) throw new Error(`Can't find duty at day ${nextDay} in duty index ${nextIdx}`);

    const { table, dispatcher } = this;

    return new DutyEditorController(duty.id, { table, dispatcher });
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
    return this.table.dutyAndWorkerRelationships.filter(relationship => relationship.dutyId === this.duty.id);
  }

  size(): number {
    return this.relationships().length;
  }

  workers(): WorkerData[] {
    const workerMap = new Map(this.table.workers.map(worker => [worker.id, worker]));

    return this.relationships().map(relationship => {
      const worker = workerMap.get(relationship.workerId);
      if (worker === undefined) throw new Error(`Can't find worker with id ${relationship.workerId}!`);

      return worker;
    });
  }

  static from(iterable: Iterable<number | DutyData>): DutyEditorController[] {
    const options: DutyEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table: useAppSelector(currentTableFromRootSelector),
    };

    return Array.from(iterable, value => {
      const dutyId = typeof value === 'number' ? value : value.id;

      return new DutyEditorController(dutyId, options);
    });
  }

  static find(day: number, index: number): DutyData {
    const table = useAppSelector(currentTableFromRootSelector);
    const duty = table.duties.find(duty => duty.day === day && duty.index === index);
    if (!duty) throw new Error(`Can't find duty at day ${day} in index ${index}`);

    return duty;
  }

  static all(): DutyEditorController[] {
    const table = useAppSelector(currentTableFromRootSelector);

    const options: DutyEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table,
    };

    return table.duties.map(duty => new DutyEditorController(duty.id, options));
  }
}