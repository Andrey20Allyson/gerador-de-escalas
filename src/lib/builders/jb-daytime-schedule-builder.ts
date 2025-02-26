import { ExtraEventName } from "../structs";
import { MultiStepScheduleAssigner } from "./assigners/multi-step-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifyingScheduleBuilder } from "./classifying-schedule-builder";

export class JBDaytimeScheduleBuilder extends ClassifyingScheduleBuilder {
  constructor(tries: number) {
    super(
      ExtraEventName.JARDIM_BOTANICO_DAYTIME,
      new DefaultScheduleClassifier(tries, MultiStepScheduleAssigner.default()),
    );
  }
}
