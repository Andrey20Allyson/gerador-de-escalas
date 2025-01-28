import { ExtraDutyTable } from "src/lib/structs";
import { BookHandler } from "src/utils/xlsx-handlers";
import { ScheduleMetadataReader } from "../metadata/reader";
import { DeserializationResult, Deserializer } from "src/lib/serialization";

export class XLSXMetadataDeserializer implements Deserializer {
  constructor() {}

  async deserialize(buffer: Buffer): Promise<DeserializationResult> {
    const book = BookHandler.parse(buffer);

    const result = await ScheduleMetadataReader.from(book).read();

    return result;
  }
}
