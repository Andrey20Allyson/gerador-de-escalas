import { DutyAndWorkerRelationship, DutyData, TableData, WorkerData } from "../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { currentTableSelector, editorActions, tableEditorSelector } from "../slices/table-editor";
import { RootState } from "../store";
import { WorkerEditorController } from "./worker-editor";
import { DutyEditorController } from "./duty-editor";

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

  findWorker(...searchers: Searcher<WorkerData>[]) {
    const worker = this.table.workers.find(worker => searchers.every(seacher => seacher(worker)));
    if (!worker) return null;

    const { dispatcher, table } = this;

    return new WorkerEditorController(worker.id, { dispatcher, table });
  }

  findDuty(...searchers: Searcher<DutyData>[]) {
    const duty = this.table.duties.find(duty => searchers.every(seacher => seacher(duty)));
    if (!duty) return null;

    const { dispatcher, table } = this;

    return new DutyEditorController(duty.id, { dispatcher, table });
  }

  load(data: TableData) {
    this.dispatcher(editorActions.initialize({ tableData: data }));
  }

  undo() {

  }

  redo() {

  }
}