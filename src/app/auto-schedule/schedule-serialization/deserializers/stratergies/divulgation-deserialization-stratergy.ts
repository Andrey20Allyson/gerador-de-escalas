import { ExtraDuty, ExtraDutyTable, ExtraEventName, WorkerInfo } from "../../../extra-duty-lib";
import { Day } from "../../../extra-duty-lib/structs/day";
import { parseWorkers } from "../../../io";
import { analyseResult, ResultError } from "../../../utils";
import { BookHandler, CellHandler, SheetHandler } from "../../../xlsx-handlers";
import { DeserializationStratergy } from "../deserialization-stratergy";

export interface WorkerDutyConfig {
  workerId: number;
  duty: ExtraDuty;
}

export class DutyHour {
  readonly duration: number;

  constructor(
    readonly start: number,
    readonly end: number,
  ) {
    this.duration = DutyHour._calcutateDuration(start, end);
  }

  protected static _calcutateDuration(start: number, end: number): number {
    if (end > start) {
      return end - start;
    }

    return 24 + end - start;
  }
}

export class DivulgationDeserializationStratergy implements DeserializationStratergy {
  protected readonly DAY_HEADER_REGEXP = /^Dia (\d{2})\/(\d{2})\/(\d+)/;
  protected readonly DUTY_HOUR_REGEXP = /\w+ \((\d{2}) ÀS (\d{2})h\)/;

  constructor(
    readonly workers: WorkerInfo[],
    readonly sheetName?: string,
  ) { }

  async execute(buffer: Buffer): Promise<ExtraDutyTable> {
    const book = BookHandler.parse(buffer);

    const sheet = book.getSheet(this.sheetName);

    const firstRow = sheet.at('a', 1).as('string');
    const firstDay = this._parseDay(firstRow.value);
    if (firstDay == null) {
      throw new Error(`first row don't matches with regexp ${this.DAY_HEADER_REGEXP.source}`);
    }

    const table = new ExtraDutyTable({
      month: firstDay.month,
      year: firstDay.year,
      currentPlace: ExtraEventName.JIQUIA,
    });

    for (const config of this._iterPersistedDuties(sheet, table)) {
      const worker = this.workers.find(worker => worker.id === config.workerId);
      if (worker == null) {
        throw new Error(`Can't find worker with id ${config.workerId}`);
      }

      config.duty.add(worker);
    }

    return table;
  }

  protected _parseDay(text: string): Day | null {
    const result = this.DAY_HEADER_REGEXP.exec(text);
    if (result == null) return null;

    const [_, dayString, monthString, yearString] = result;

    const day = parseInt(dayString!) - 1;
    const month = parseInt(monthString!) - 1;
    const year = parseInt(yearString!);

    return new Day(year, month, day);
  }

  protected *_iterPersistedDuties(sheet: SheetHandler, table: ExtraDutyTable): Iterable<WorkerDutyConfig> {
    for (const lineDay of sheet.iterLines()) {
      const dayCell = lineDay.at('a');
      if (!dayCell.is('string')) {
        continue;
      }

      const day = this._parseDay(dayCell.value);
      if (day == null) {
        continue;
      }

      for (const infoLine of sheet.iterLines(lineDay.line + 2)) {
        const cells = infoLine.getCells(['a', 'c']);
        const typedCells = CellHandler.safeTypeAll(cells, ['string', 'string']);
        if (ResultError.isError(typedCells)) {
          break;
        }

        const [hourCell, workerIdCell] = typedCells;

        const hour = this._parseDutyHour(hourCell.value);
        const workerId = this._parseWorkerId(workerIdCell.value);
        if (hour == null || workerId == null) {
          break;
        }

        const dutySequenceLength = Math.trunc(hour.duration / table.config.dutyDuration);
        const dutySequenceFirstIndex = Math.trunc((hour.start - table.config.firstDutyTime) / table.config.dutyDuration);

        for (let i = 0; i < dutySequenceLength; i++) {
          const duty = table.findDay(day)!.at(dutySequenceFirstIndex + i)!;

          yield { duty, workerId };
        }
      }
    }
  }

  protected _parseDutyHour(text: string): DutyHour | null {
    const result = this.DUTY_HOUR_REGEXP.exec(text);
    if (result == null) {
      return null;
    }

    const [_, startText, endText] = result;

    return new DutyHour(
      parseInt(startText!),
      parseInt(endText!),
    );
  }

  protected _parseWorkerId(text: string): number | null {
    const workerId = parseInt(text.replace(/[.-]/g, ''));
    if (isNaN(workerId)) {
      return null;
    } 
    
    return workerId;
  }
}