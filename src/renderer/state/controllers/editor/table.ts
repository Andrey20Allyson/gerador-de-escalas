import { DutyData, TableData, WorkerData } from "../../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { dayOfWeekFrom, firstMondayFromYearAndMonth } from "../../../utils";
import { Searcher } from "../../../utils/searcher";
import { currentTableSelector, editorActions, tableEditorSelector } from "../../slices/table-editor";
import { RootState } from "../../store";
import { DutyEditorController } from "./duty";
import { WorkerEditorController } from "./worker";

export function currentTableFromRootSelector(state: RootState) {
  const table = currentTableSelector(tableEditorSelector(state));
  if (table === null) throw new Error(`Table editor hasn't initialized yet!`);

  return table;
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

  findWorker(searcher: Searcher<WorkerData>): WorkerEditorController | null {
    const worker = this.table.workers.find(searcher.everyMatchesHandler());
    if (!worker) return null;

    const { dispatcher, table } = this;

    return new WorkerEditorController(worker.id, { dispatcher, table });
  }

  findWorkers(searcher: Searcher<WorkerData>): WorkerEditorController[] {
    const { table, dispatcher } = this;

    return this.table.workers
      .filter(searcher.everyMatchesHandler())
      .map(worker => new WorkerEditorController(worker.id, { table, dispatcher }));
  }

  findDuty(searcher: Searcher<DutyData>): DutyEditorController | null {
    const duty = this.table.duties.find(searcher.everyMatchesHandler());
    if (!duty) return null;

    const { dispatcher, table } = this;

    return new DutyEditorController(duty.id, { dispatcher, table });
  }

  findDuties(searcher: Searcher<DutyData>): DutyEditorController[] {
    const { table, dispatcher } = this;

    return this.table.duties
      .filter(searcher.everyMatchesHandler())
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
    for (let dutyIdx = 0; dutyIdx < this.table.config.dutiesPerDay; dutyIdx++) {
      yield dutyIdx;
    }
  }

  load(data: TableData) {
    this.dispatcher(editorActions.initialize({ tableData: data }));
  }

  undo() {
    this.dispatcher(editorActions.undo());
  }

  redo() {
    this.dispatcher(editorActions.redo());
  }

  clear() {
    this.dispatcher(editorActions.clear());
  }

  static useOptional() {
    const table = useAppSelector(state => currentTableSelector(state.tableEditor));
    const dispatcher = useAppDispatch();

    const controller = table ? new TableEditorController({ dispatcher, table }) : null;

    return controller;
  }

  static useEditorLoader() {
    const dispatcher = useAppDispatch();
    const isLoaded = useAppSelector(state => currentTableSelector(state.tableEditor)) !== null;

    function load(table: TableData) {
      dispatcher(editorActions.initialize({ tableData: table }));
    }

    return { load, isLoaded };
  }
}