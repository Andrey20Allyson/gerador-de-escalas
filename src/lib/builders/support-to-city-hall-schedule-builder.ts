import { ExtraEventName } from "../structs";
import { MultiStepScheduleAssigner } from "./assigners/multi-step-assigner";
import { DefaultScheduleClassifier } from "./classifiers/classifier";
import { ClassifyingScheduleBuilder } from "./classifying-schedule-builder";

export class SupportToCHScheduleBuilder extends ClassifyingScheduleBuilder {
  constructor(tries: number) {
    super(
      ExtraEventName.SUPPORT_TO_CITY_HALL,
      new DefaultScheduleClassifier(tries, MultiStepScheduleAssigner.default()),
    );
  }
}
