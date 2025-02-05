import { WorkerInsertionRulesState } from "src/apploader/api/table-reactive-edition";
import { ScheduleState } from "../../../../../apploader/api/table-reactive-edition";
import { useAppDispatch, useAppSelector } from "../../../../hooks";
import { editorActions } from "../../../slices/table-editor";
import { DutyEditorController } from "../duty";
import {
  DispatcherType,
  EditorControllerOptions,
  currentTableFromRootSelector,
} from "../table";
import { WorkerEditorController } from "../worker";
import { DayRestrictionRule } from "./impl/day-restriction-rule";
import { DutyCapacityRule } from "./impl/duty-capacity-rule";
import { DutyMinDistanceRule } from "./impl/duty-min-distance-rule";
import { GenderRule } from "./impl/gender-rule";
import { InspRule } from "./impl/insp-rule";
import { WorkerCapacityRule } from "./impl/worker-capacity-rule";
import { AssignmentInvalidation, EditorRule } from "./rule";

export interface EditorRulesServiceOpitons extends EditorControllerOptions {}

export interface AssignmentCheckResult {
  readonly invalidations: AssignmentInvalidation[];
  readonly isValid: boolean;
}

export class EditorRulesService {
  dispatcher: DispatcherType;
  table: ScheduleState;
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

    this.initializeRules();
  }

  initializeRules() {
    const tableRules = this.table.rules;

    this.rules.push(new DutyCapacityRule(), new WorkerCapacityRule());

    if (tableRules.femaleRule) this.rules.push(new GenderRule());

    if (tableRules.inspRule) this.rules.push(new InspRule());

    if (tableRules.ordinaryRule) this.rules.push(new DayRestrictionRule());

    if (tableRules.timeOffRule) this.rules.push(new DutyMinDistanceRule());
  }

  getWorkerAndDuty(workerId: number, dutyId: number) {
    const { table, dispatcher } = this;

    const workerController = new WorkerEditorController(workerId, {
      dispatcher,
      table,
    });
    const dutyController = new DutyEditorController(dutyId, {
      dispatcher,
      table,
    });

    return { workerController, dutyController };
  }

  checkAssignment(workerId: number, dutyId: number): AssignmentCheckResult {
    const { dutyController, workerController } = this.getWorkerAndDuty(
      workerId,
      dutyId,
    );

    const invalidations: AssignmentInvalidation[] = [];

    for (const rule of this.rules) {
      const invalidation = rule.checkForInvalidations(
        workerController,
        dutyController,
      );

      if (invalidation != null) {
        invalidations.push(invalidation);
      }
    }

    return {
      invalidations,
      isValid: invalidations.length === 0,
    };
  }

  disableRule(rule: keyof WorkerInsertionRulesState) {
    this.dispatcher(editorActions.setRule({ rule, value: false }));
  }

  enableRule(rule: keyof WorkerInsertionRulesState) {
    this.dispatcher(editorActions.setRule({ rule, value: true }));
  }
}
