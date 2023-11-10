import { useAppDispatch, useAppSelector } from "@gde/renderer/hooks";
import { addRelationship, currentTableSelector, removeRelationship, tableEditorSelector } from "../slices/table-editor";
import { DutyAndWorkerRelationship, DutyData, TableData, WorkerData } from "@gde/app/api/table-reactive-edition/table";
import { useDispatch } from "react-redux";
import { RootState } from "../store";

export function currentTableFromRootSelector(state: RootState) {
  const table = currentTableSelector(tableEditorSelector(state));
  if (table === null) throw new Error(`Table editor has't initialized yet!`);

  return table;
}

export class DutyEditorController {
  readonly dispatcher = useAppDispatch();
  readonly table: TableData;
  readonly duty: DutyData;

  constructor(dutyId: number) {
    this.table = useAppSelector(currentTableFromRootSelector);

    const duty = this.table.duties.find(duty => duty.id === dutyId);
    if (duty === undefined) throw new Error(`Duty with id ${dutyId} can't be found!`);

    this.duty = duty;
  }

  remove(workerId: number): this {
    const foundRelationship = this.table.dutyAndWorkerRelationships.find(relationship => {
      return relationship.workerId === workerId && relationship.dutyId === this.duty.id;
    });
    if (foundRelationship === undefined) return this;

    this.dispatcher(removeRelationship({ id: foundRelationship.id }));

    return this;
  }

  add(workerId: number): this {
    const alreadyHasHelationship = this.table.dutyAndWorkerRelationships.some(relationship => {
      return relationship.dutyId === this.duty.id && relationship.workerId === workerId;
    });
    if (alreadyHasHelationship) return this;

    this.dispatcher(addRelationship({ dutyId: this.duty.id, workerId }));

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

  static from(array: (number | DutyData)[]): DutyEditorController[] {
    return array.map(value => {
      if (typeof value === 'number') {
        return new DutyEditorController(value);
      } else {
        return new DutyEditorController(value.id);
      }
    });
  }
}

export class WorkerEditorController {
  readonly dispatcher = useDispatch();
  readonly table: TableData;
  readonly worker: WorkerData;

  constructor(workerId: number) {
    this.table = useAppSelector(currentTableFromRootSelector);

    const worker = this.table.workers.find(worker => worker.id === workerId);
    if (worker === undefined) throw new Error(`Worker with id ${workerId} can't be found!`);

    this.worker = worker;
  }

  leave(dutyId: number) {
    const foundRelationship = this.table.dutyAndWorkerRelationships.find(relationship => {
      return relationship.dutyId === dutyId && relationship.dutyId === this.worker.id;
    });
    if (foundRelationship === undefined) return this;

    this.dispatcher(removeRelationship({ id: foundRelationship.id }));

    return this;
  }

  enter(dutyId: number) {
    const alreadyHasHelationship = this.table.dutyAndWorkerRelationships.some(relationship => {
      return relationship.workerId === this.worker.id && relationship.dutyId === dutyId;
    });
    if (alreadyHasHelationship) return this;

    this.dispatcher(addRelationship({ workerId: this.worker.id, dutyId }));

    return this;
  }

  relationships() {
    return this.table.dutyAndWorkerRelationships.filter(relationship => relationship.workerId === this.worker.id);
  }

  duties(): DutyData[] {
    const dutyMap = new Map(this.table.duties.map(duty => [duty.id, duty]));

    return this.relationships().map(relationship => {
      const duty = dutyMap.get(relationship.dutyId);
      if (duty === undefined) throw new Error(`Can't find duty with id ${relationship.dutyId}!`);

      return duty;
    });
  }
}

export class TableEditorController { }