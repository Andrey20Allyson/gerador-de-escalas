import { ExtraDutyTable } from "src/lib/structs";
import { BookHandler } from "src/utils/xlsx-handlers";
import { ScheduleMetadataReader } from "../metadata/reader";
import { Deserializer } from "src/lib/serialization";

export class XLSXMetadataDeserializer implements Deserializer {
  constructor() {}

  async deserialize(buffer: Buffer): Promise<ExtraDutyTable> {
    const book = BookHandler.parse(buffer);

    const table = await ScheduleMetadataReader.from(book).read();

    return table;
  }
}
