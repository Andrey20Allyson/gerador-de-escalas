import { ExtraDutyTable } from "../../../extra-duty-lib";
import ExcelJS from 'exceljs';
import { JsonSerializationStratergy } from "../../serializers/stratergies/json-serialization-stratergy";

export class ScheduleMetadataWriter {
  constructor(readonly workbook: ExcelJS.Workbook) { }

  async write(table: ExtraDutyTable) {
    const metadataSheet = this.workbook.addWorksheet('__ASG_META__', { state: 'veryHidden' });

    const buffer = await new JsonSerializationStratergy().execute(table);
    metadataSheet.getCell(1, 1).value = buffer.toString('utf-8');
  }

  static into(workbook: ExcelJS.Workbook) {
    return new ScheduleMetadataWriter(workbook);
  }
}