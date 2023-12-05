import { DutyAndWorkerRelationship, TableData, WorkerData } from "@gde/app/api/table-reactive-edition/table";
import { useAppDispatch } from "@gde/renderer/hooks";
import { currentTableSelector, editorActions, tableEditorSelector } from "../slices/table-editor";
import { RootState } from "../store";

export function currentTableFromRootSelector(state: RootState) {
  const table = currentTableSelector(tableEditorSelector(state));
  if (table === null) throw new Error(`Table editor has't initialized yet!`);

  return table;
}

export interface IDutyEditor {
  remove(workerId: number): this;
  add(workerId: number): this;
  relationships(): DutyAndWorkerRelationship[];
  size(): number;
  workers(): WorkerData[];
}

export type DispatcherType = ReturnType<typeof useAppDispatch>;

export interface EditorControllerOptions {
  dispatcher?: DispatcherType;
  table?: TableData;
}

export interface TableEditorControllerOptions extends EditorControllerOptions { }

export class TableEditorController {
  dispatcher: DispatcherType;
  constructor(options: TableEditorControllerOptions = {}) {
    const {
      dispatcher = useAppDispatch(),
    } = options;

    this.dispatcher = dispatcher;
  }

  load(data: TableData) {
    this.dispatcher(editorActions.initialize({ tableData: data }));
  }

  undo() {

  }

  redo() {

  }
}