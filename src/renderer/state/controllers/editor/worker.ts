import { TableData, WorkerData, DutyData } from "../../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../../hooks";
import { editorActions } from "../../slices/table-editor";
import { EditorControllerOptions, DispatcherType, currentTableFromRootSelector } from "./table";

export interface WorkerEditorControllerOptions extends EditorControllerOptions { }

export class WorkerEditorController {
  readonly dispatcher: DispatcherType;
  readonly table: TableData;
  readonly worker: WorkerData;

  constructor(workerId: number);
  constructor(workerId: number, options: WorkerEditorControllerOptions);
  constructor(workerId: number, options: WorkerEditorControllerOptions = {}) {
    const {
      dispatcher = useAppDispatch(),
      table = useAppSelector(currentTableFromRootSelector),
    } = options;
    this.table = table;
    this.dispatcher = dispatcher;

    const worker = this.table.workers.find(worker => worker.id === workerId);
    if (worker === undefined) throw new Error(`Worker with id ${workerId} can't be found!`);

    this.worker = worker;
  }

  leave(dutyId: number) {
    const foundRelationship = this.table.dutyAndWorkerRelationships.find(relationship => {
      return relationship.dutyId === dutyId && relationship.workerId === this.worker.id;
    });
    if (foundRelationship === undefined) return this;

    this.dispatcher(editorActions.removeRelationship({ id: foundRelationship.id }));

    return this;
  }

  leaveAll() {
    for (const duty of this.duties()) {
      this.leave(duty.id);      
    }

    return this;
  }

  enter(dutyId: number) {
    const alreadyHasHelationship = this.table.dutyAndWorkerRelationships.some(relationship => {
      return relationship.workerId === this.worker.id && relationship.dutyId === dutyId;
    });
    if (alreadyHasHelationship) return this;

    this.dispatcher(editorActions.addRelationship({ workerId: this.worker.id, dutyId }));

    return this;
  }

  relationships() {
    return this.table.dutyAndWorkerRelationships.filter(relationship => relationship.workerId === this.worker.id);
  }

  dutyIds(): number[] {
    return this.duties().map(duty => duty.id);
  }

  duties(): DutyData[] {
    const dutyMap = new Map(this.table.duties.map(duty => [duty.id, duty]));

    return this.relationships().map(relationship => {
      const duty = dutyMap.get(relationship.dutyId);
      if (duty === undefined) throw new Error(`Can't find duty with id ${relationship.dutyId}!`);

      return duty;
    });
  }

  dutyQuantity(): number {
    return this.relationships().length;
  }

  dutyMinDistance(): number {
    return this.worker.ordinary.isDailyWorker ? 1 : this.table.config.dutyMinDistance;
  }

  static from(iterable: Iterable<number | WorkerData>): WorkerEditorController[] {
    const options: WorkerEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table: useAppSelector(currentTableFromRootSelector),
    };

    return Array.from(iterable, value => {
      const dutyId = typeof value === 'number' ? value : value.id;

      return new WorkerEditorController(dutyId, options);
    });
  }

  static all() {
    const table = useAppSelector(currentTableFromRootSelector);

    const options: WorkerEditorControllerOptions = {
      dispatcher: useAppDispatch(),
      table,
    };

    return table.workers.map(worker => new WorkerEditorController(worker.id, options));
  }
}