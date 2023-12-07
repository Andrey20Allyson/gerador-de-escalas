import { WorkerInsertionRulesState } from "../../../../../app/api/table-edition";
import { TableData } from "../../../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { DutyEditorController } from "../duty";
import { DispatcherType, EditorControllerOptions, currentTableFromRootSelector } from "../table";
import { WorkerEditorController } from "../worker";

export interface EditorRulesServiceOpitons extends EditorControllerOptions { }

export class EditorRulesService {
  dispatcher: DispatcherType;
  table: TableData;

  constructor();
  constructor(options: EditorRulesServiceOpitons);
  constructor(options: EditorRulesServiceOpitons = {}) {
    const {
      dispatcher = useAppDispatch(),
      table = useAppSelector(currentTableFromRootSelector),
    } = options;

    this.dispatcher = dispatcher;
    this.table = table;
  }

  getWorkerAndDuty(workerId: number, dutyId: number) {
    const { table, dispatcher } = this;

    const workerController = new WorkerEditorController(workerId, { dispatcher, table });
    const dutyController = new DutyEditorController(dutyId, { dispatcher, table });
    
    return { workerController, dutyController };
  }

  workerCanEnter(workerId: number, dutyId: number) {
    const { dutyController, workerController } = this.getWorkerAndDuty(workerId, dutyId);
  }

  dutyCanAccept(workerId: number, dutyId: number) {

  }

  disableRule(rule: string) {

  }

  enableRule(rule: string) {

  }

  rules(): WorkerInsertionRulesState {
    return this.table.rules;
  }
}