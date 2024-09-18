import { ExtraDutyTable, WorkerInfo } from "../../../extra-duty-lib";
import ExcelJS from 'exceljs';

class ScheduleMetadataWriter {
  constructor(readonly workbook: ExcelJS.Workbook) { }

  write(table: ExtraDutyTable, workers: WorkerInfo[]) {
    const metadataSheet = this.workbook.addWorksheet('__META__');



    metadataSheet.getCell(1, 1).value = 
  }

  static into(workbook: ExcelJS.Workbook) {

  }
}