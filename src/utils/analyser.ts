import chalk from "chalk";
import { Text } from './text';
import { ExtraDuty, ExtraDutyTable, ExtraEventName, WorkerInfo } from "../lib/extra-duty-lib";
import { enumerate } from "./iteration";
import { Day } from "../lib/extra-duty-lib/structs/day";

export type StringReducer = (text: string) => string

export class DutyFormattingStream {
  constructor(readonly duty: ExtraDuty, readonly text: string) { }

  change(text: string) {
    return new DutyFormattingStream(this.duty, text);
  }

  transform(reducer: StringReducer): DutyFormattingStream {
    return this.change(reducer(this.text));
  }

  prefix(text: string): DutyFormattingStream {
    return this.change(text + this.text);
  }

  sufix(text: string): DutyFormattingStream {
    return this.change(this.text + text);
  }

  static fromSize(duty: ExtraDuty): DutyFormattingStream {
    return new DutyFormattingStream(duty, duty.getSize().toString());
  }

  static toString(stream: DutyFormattingStream) {
    return stream.text;
  }
}

export function dutyToColored(stream: DutyFormattingStream): DutyFormattingStream {
  const { duty } = stream;
  const size = duty.getSize();

  if (duty.isActive() === false) return stream.transform(chalk.grey);

  switch (size) {
    case 0:
      return stream.transform(chalk.cyanBright);
    case 2:
      return stream.transform(chalk.greenBright);
    case 3:
      return stream.transform(chalk.yellow);
  }

  return stream.transform(chalk.red);
}

export function dutyToRuleIndicators(stream: DutyFormattingStream): DutyFormattingStream {
  const { duty } = stream;

  const femaleOnlyIndicatorColor = duty.genderIsOnly('female') ? chalk.redBright : chalk.grey;
  const gcmOnlyIndicatorColor = duty.gradIsOnly('gcm') ? chalk.redBright : chalk.grey;

  return stream
    .sufix('-')
    .sufix(femaleOnlyIndicatorColor('F'))
    .sufix(gcmOnlyIndicatorColor('G'));
}

export function analyseResult(table: ExtraDutyTable, colors = true, events: string[] = [ExtraEventName.JIQUIA]) {
  let analysisText = new Text();
  const initialEventName = table.config.currentPlace;

  analysisText.writeLn(chalk.underline(`[ Numero de funcionários em cada turno do dia ]`));

  const workersWithPositionsLeft = new Set<WorkerInfo>();

  for (const day of table) {
    let numOfWorkersInThisDay = 0;

    const formatedDutySizesList: string[] = [];

    for (const place of events) {
      let duties: ExtraDuty[] = Array.from(day);
      table.config.currentPlace = place;

      for (const duty of day) {
        const size = duty.getSize();

        for (const [_, worker] of duty) {
          if (table.limiter.positionsLeftOf(worker) > 0) workersWithPositionsLeft.add(worker);
        }

        numOfWorkersInThisDay += size;
      }

      const formattedDutyRowSlice = duties
        .map(DutyFormattingStream.fromSize)
        .map(dutyToColored)
        .map(dutyToRuleIndicators)
        .map(DutyFormattingStream.toString)
        .join(' , ');

      formatedDutySizesList.push(formattedDutyRowSlice);
    }

    const formatedDay = chalk.white(day.date.toString());

    analysisText.writeLn(chalk.gray(`  (${formatedDay}) => [ ${formatedDutySizesList.join(' ] | [ ')} ]`));
  }

  table.config.currentPlace = initialEventName;

  return analysisText.read();
}