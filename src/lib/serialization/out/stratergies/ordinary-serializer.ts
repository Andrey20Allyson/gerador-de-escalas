import { ExtraDutyTable } from "src/lib/structs";
import { Serializer } from "../serializer";
import ExcelJS from "exceljs";
import { ScheduleMetadataWriter } from "../metadata/writer";

export class OrdinarySerializer implements Serializer {
  constructor(readonly baseFilePath: string) {}

  async serialize(table: ExtraDutyTable): Promise<Buffer> {
    const book = new ExcelJS.Workbook();
    await book.xlsx.readFile(this.baseFilePath);

    ScheduleMetadataWriter.into(book).write(table, { type: "ordinary" });

    const arrayBuffer = await book.xlsx.writeBuffer();

    return Buffer.from(arrayBuffer);
  }
}
