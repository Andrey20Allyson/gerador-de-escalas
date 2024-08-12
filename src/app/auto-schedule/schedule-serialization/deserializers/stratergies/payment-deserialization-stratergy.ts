import { ExtraDutyTable, WorkerInfo } from "../../../extra-duty-lib";
import { Day } from "../../../extra-duty-lib/structs/day";
import { ResultError } from "../../../utils";
import { BookHandler, CellHandler, LineHander } from "../../../xlsx-handlers";
import { ExcelTime } from "../../../xlsx-handlers/utils";
import { DeserializationStratergy } from "../deserialization-stratergy";

export class PaymentDeserializationStratergy implements DeserializationStratergy {
  readonly finalTableCollumns = LineHander.collumnTuple([
    'c', // registration
    'i', // date
    'j', // start time
    'k', // end time
  ]);
  
  readonly finalTableCellTypes = CellHandler.typeTuple([
    'number',
    'number',
    'number',
  ]);
  
  constructor(
    readonly workers: WorkerInfo[],
    readonly sheetName?: string,
  ) { }

  async execute(buffer: Buffer): Promise<ExtraDutyTable> {
    const book = BookHandler.parse(buffer);

    const sheet = book.getSheet(this.sheetName);

    const month = sheet.at('c', 7).as('number').value - 1;
    const year = sheet.at('c', 6).as('number').value;

    const table = new ExtraDutyTable({
      month,
      year,
    });

    const workerMap = WorkerInfo.mapFrom(this.workers);

    for (const line of sheet.iterLines(15)) {
      const selectionResult = CellHandler.safeTypeAll(line.getCells(this.finalTableCollumns), this.finalTableCellTypes);
      if (ResultError.isError(selectionResult)) break;

      const [registrationCell, dateCell, startTimeCell] = selectionResult;

      const workerID = registrationCell.value;

      const worker = workerMap.get(workerID);
      if (!worker) throw new Error(`Can't find worker with id "${workerID}"`);

      const date = new Date(1900, 0, dateCell.value - 1);
      const startTime = ExcelTime.parse(startTimeCell.value);

      const day = Day.fromDate(date);

      const dayOfDuty = table.findDay(day);
      if (dayOfDuty == null) throw new Error(`Can't find day of duty from ${day.toString()}`);

      const { firstDutyTime, dutyDuration } = dayOfDuty.config;
      const startHour = startTime.hours;

      const duty = dayOfDuty.getDuty(Math.floor((startHour < firstDutyTime ? startHour + 24 - firstDutyTime : startTime.hours - firstDutyTime) / dutyDuration));

      if (!duty.has(worker)) duty.add(worker);
    }

    return table;
  }
}