import { TableData, DutyData, DutyAndWorkerRelationship, WorkerData } from "@gde/app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "@gde/renderer/hooks";
import { editorActions } from "../slices/table-editor";
import { EditorControllerOptions, IDutyEditor, DispatcherType, currentTableFromRootSelector } from "./table-editor";

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

  static all(): DutyEditorController[] {
    const table = useAppSelector(currentTableFromRootSelector);
    
    const options: DutyEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table,
    };

    return table.duties.map(duty => new DutyEditorController(duty.id, options));
  }
}