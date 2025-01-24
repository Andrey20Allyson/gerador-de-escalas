import { ExtraDutyTable, WorkerInfo } from "../structs";
import { ScheduleClassifier } from "./classifiers/classifier";

export interface ScheduleBuilder {
  /**
   * this method can mutates the `table` object
   */
  build(table: ExtraDutyTable): ExtraDutyTable;
}
