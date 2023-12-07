import { DutyData, TableData, WorkerData } from "../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../utils";
import { currentTableSelector, editorActions, tableEditorSelector } from "../slices/table-editor";
import { RootState } from "../store";
import { DutyEditorController } from "./duty-editor";
import { WorkerEditorController } from "./worker-editor";

export function currentTableFromRootSelector(state: RootState) {
  const table = currentTableSelector(tableEditorSelector(state));
  if (table === null) throw new Error(`Table editor has't initialized yet!`);

  return table;
}

export type Searcher<T> = (value: T) => boolean;
export type SearcherFactory<T> = (...args: any[]) => Searcher<T>;

export namespace Searcher {
  export const worker = {
    nameEquals(name: string) {
      return worker => worker.name === name
    },
  } satisfies Record<string, SearcherFactory<WorkerData>>;

  export const duty = {
    dayEquals(day: number) {
      return duty => duty.day === day;
    },
    indexEquals(index: number) {
      return duty => duty.index === index;
    },
  } satisfies Record<string, SearcherFactory<DutyData>>;
}

export type DispatcherType = ReturnType<typeof useAppDispatch>;

export interface EditorControllerOptions {
  dispatcher?: DispatcherType;
  table?: TableData;
}

export interface TableEditorControllerOptions extends EditorControllerOptions { }

export class TableEditorController {
  dispatcher: DispatcherType;
  table: TableData;

  constructor(options: TableEditorControllerOptions = {}) {
    const {
      table = useAppSelector(currentTableFromRootSelector),
      dispatcher = useAppDispatch(),
    } = options;

    this.dispatcher = dispatcher;
    this.table = table;
  }

  findWorker(...searchers: Searcher<WorkerData>[]): WorkerEditorController | null {
    const worker = this.table.workers.find(worker => searchers.every(seacher => seacher(worker)));
    if (!worker) return null;

    const { dispatcher, table } = this;

    return new WorkerEditorController(worker.id, { dispatcher, table });
  }

  findWorkers(...searchers: Searcher<WorkerData>[]): WorkerEditorController[] {
    const { table, dispatcher } = this;

    return this.table.workers
      .filter(worker => searchers.every(searcher => searcher(worker)))
      .map(worker => new WorkerEditorController(worker.id, { table, dispatcher }));
  }

  findDuty(...searchers: Searcher<DutyData>[]): DutyEditorController | null {
    const duty = this.table.duties.find(duty => searchers.every(seacher => seacher(duty)));
    if (!duty) return null;

    const { dispatcher, table } = this;

    return new DutyEditorController(duty.id, { dispatcher, table });
  }

  findDuties(...searchers: Searcher<DutyData>[]): DutyEditorController[] {
    const { table, dispatcher } = this;

    return this.table.duties
      .filter(duty => searchers.every(searcher => searcher(duty)))
      .map(duty => new DutyEditorController(duty.id, { table, dispatcher }));
  }

  dayOfWeekFrom(day: number) {
    const { year, month } = this.table.config;

    const firstMonday = firstMondayFromYearAndMonth(year, month);

    return dayOfWeekFrom(firstMonday, day);
  }

  duties(): DutyData[] {
    return this.table.duties;
  }

  workers(): WorkerData[] {
    return this.table.workers;
  }

  dutyIds(): number[] {
    return this.duties().map(duty => duty.id);
  }

  workerIds(): number[] {
    return this.workers().map(worker => worker.id);
  }

  *iterDays(): Iterable<number> {
    for (let day = 0; day < this.table.config.numOfDays; day++) {
      yield day;
    }
  }

  *iterDutyIndexes(): Iterable<number> {
    for (let dutyIdx = 0; dutyIdx < this.table.config.dutyCapacity; dutyIdx++) {
      yield dutyIdx;
    }
  }

  load(data: TableData) {
    this.dispatcher(editorActions.initialize({ tableData: data }));
  }

  undo() {

  }

  redo() {

  }

  clear() {
    
  }

  static useEditorLoader() {
    const dispatcher = useAppDispatch();
    
    function load(table: TableData) {
      dispatcher(editorActions.initialize({ tableData: table }));
    }

    return { load };
  }
}