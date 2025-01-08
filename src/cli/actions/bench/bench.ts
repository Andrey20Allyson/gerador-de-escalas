import { RandomWorkerMockFactory } from "src/cli/mock/worker/random";

import { MultiStepScheduleAssigner } from "src/lib/builders/assigners/multi-step-assigner";
import { AssignmentRuleStack } from "src/lib/builders/rule-checking";
import {
  BusyWorkerAssignmentRule,
  DutyLimitAssignmentRule,
  FemaleAssignmentRule,
  InspAssignmentRule,
  LicenseAssignmentRule,
  OrdinaryAssignmentRule,
  TimeOffAssignmentRule,
} from "src/lib/builders/rule-checking/rules";
import { ExtraEventAllowedTimeRule } from "src/lib/builders/rule-checking/rules/extra-event-allowed-time-rule";
import { ExtraEventAllowedWeekdaysRule } from "src/lib/builders/rule-checking/rules/extra-event-allowed-weekdays-rule";
import { ExtraEventStartDayRule } from "src/lib/builders/rule-checking/rules/extra-event-start-day";
import { ExtraDutyTable, ExtraEventName, Month } from "src/lib/structs";

import { Benchmarker, enumerate, iterRange } from "src/utils";

import { z } from "zod";

import { ProgressBar } from "./progress-bar";

export const benchOptionsSchema = z.object({
  times: z.number({ coerce: true }).default(1),
  weight: z
    .enum(["low", "mid", "high"])
    .default("low")
    .transform((weight) => {
      switch (weight) {
        case "low":
          return 0;
        case "mid":
          return 1;
        case "high":
          return 2;
      }
    }),
});

export type BenchActionOptions = z.infer<typeof benchOptionsSchema>;

export function bench(options: BenchActionOptions) {
  const { times, weight } = options;

  const month = Month.now();

  const table = new ExtraDutyTable({ month, dutyMinDistance: 6 });
  const workers = new RandomWorkerMockFactory({ month }).array(27);

  let ruleStack = new AssignmentRuleStack([
    new DutyLimitAssignmentRule(),
    new BusyWorkerAssignmentRule(),
    new InspAssignmentRule(),
    new FemaleAssignmentRule(),
  ]);

  if (weight >= 1) {
    ruleStack = ruleStack.use(
      new ExtraEventStartDayRule(),
      new ExtraEventAllowedTimeRule(),
      new ExtraEventAllowedWeekdaysRule(),
      new LicenseAssignmentRule(),
      new OrdinaryAssignmentRule(),
      new TimeOffAssignmentRule(),
    );
  }

  const assigner = new MultiStepScheduleAssigner(
    ruleStack,
    MultiStepScheduleAssigner.defaultSteps(),
  );

  const benchmarker = new Benchmarker();

  const events = [ExtraEventName.JIQUIA];

  if (weight >= 2) {
    events.unshift(
      ExtraEventName.SUPPORT_TO_CITY_HALL,
      ExtraEventName.JARDIM_BOTANICO_DAYTIME,
    );
  }

  const totalOfAssigns = times * events.length;
  const progress = new ProgressBar(totalOfAssigns, 0.05);

  progress.start();
  const multipleAssigments = benchmarker.start("Multiple assigments");

  for (const [i, event] of enumerate(events)) {
    table.config.currentPlace = event;

    for (let j of iterRange(0, times)) {
      table.clear(event);

      assigner.assignInto(table, workers);

      progress.update(times * i + j + 1);
    }
  }

  multipleAssigments.end();

  const valuesPerSecStr = progress
    .getValuesPer("sec")
    // .filter(ValuesPerTimeEntry.higherOrLower)
    .join("\n  ");

  console.log(`Values per sec [\n  ${valuesPerSecStr}\n]`);

  console.log(
    `Runned ${((totalOfAssigns / multipleAssigments.difInMillis()) * 1000).toFixed(0)} aps`,
  );
}
