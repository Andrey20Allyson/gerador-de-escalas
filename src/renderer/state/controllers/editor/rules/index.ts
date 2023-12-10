import { WorkerInsertionRulesState } from "../../../../../app/api/table-edition";
import { TableData } from "../../../../../app/api/table-reactive-edition/table";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { editorActions } from "../../../slices/table-editor";
import { DutyEditorController } from "../duty";
import { DispatcherType, EditorControllerOptions, currentTableFromRootSelector } from "../table";
import { WorkerEditorController } from "../worker";
import { DayRestrictionRule } from "./impl/day-restriction-rule";
import { DutyCapacityRule } from "./impl/duty-capacity-rule";
import { DutyIntervalRule } from "./impl/duty-interval-rule";
import { GenderRule } from "./impl/gender-rule";
import { InspRule } from "./impl/insp-rule";
import { WorkerCapacityRule } from "./impl/worker-capacity-rule";
import { EditorRule } from "./rule";

export interface EditorRulesServiceOpitons extends EditorControllerOptions { }

export class EditorRulesService {
  dispatcher: DispatcherType;
  table: TableData;
  rules: EditorRule[] = [];

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

  initializeRules() {
    const tableRules = this.table.rules;

    this.rules.push(
      new DutyCapacityRule(),
      new WorkerCapacityRule(),
    );

    if (tableRules.femaleRule) this.rules.push(new GenderRule());

    if (tableRules.inspRule) this.rules.push(new InspRule());

    if (tableRules.ordinaryRule) this.rules.push(new DayRestrictionRule());

    if (tableRules.timeOffRule) this.rules.push(new DutyIntervalRule());
  }

  getWorkerAndDuty(workerId: number, dutyId: number) {
    const { table, dispatcher } = this;

    const workerController = new WorkerEditorController(workerId, { dispatcher, table });
    const dutyController = new DutyEditorController(dutyId, { dispatcher, table });

    return { workerController, dutyController };
  }

  check(workerId: number, dutyId: number) {
    const { dutyController, workerController } = this.getWorkerAndDuty(workerId, dutyId);

    for (const rule of this.rules) {
      if (rule.test(workerController, dutyController) === false) return false;
    }

    return true;
  }

  disableRule(rule: keyof WorkerInsertionRulesState) {
    this.dispatcher(editorActions.setRule({ rule, value: false }));
  }
  
  enableRule(rule: keyof WorkerInsertionRulesState) {
    this.dispatcher(editorActions.setRule({ rule, value: true }));
  }
}