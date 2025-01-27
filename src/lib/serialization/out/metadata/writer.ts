import { ExtraDutyTable } from "src/lib/structs";
import ExcelJS from "exceljs";
import { JsonSerializationStratergy } from "src/lib/serialization/out";
import { ScheduleFileInfo } from "../..";

export class ScheduleMetadataWriter {
  constructor(readonly workbook: ExcelJS.Workbook) {}

  async write(table: ExtraDutyTable, fileInfo: ScheduleFileInfo) {
    const metadataSheet = this.workbook.addWorksheet("__ASG_META__", {
      state: "veryHidden",
    });

    const buffer = await new JsonSerializationStratergy(fileInfo).serialize(
      table,
    );
    metadataSheet.getCell(1, 1).value = buffer.toString("utf-8");
  }

  static into(workbook: ExcelJS.Workbook) {
    return new ScheduleMetadataWriter(workbook);
  }
}
