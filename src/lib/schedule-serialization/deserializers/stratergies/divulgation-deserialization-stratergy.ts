import { ExtraDutyTable } from "../../../extra-duty-lib";
import { BookHandler } from "../../../xlsx-handlers";
import { ScheduleMetadataReader } from "../../lib/metadata/schedule-metadata-reader";
import { DeserializationStratergy } from "../deserialization-stratergy";

export class DivulgationDeserializationStratergy
  implements DeserializationStratergy
{
  constructor() {}

  async execute(buffer: Buffer): Promise<ExtraDutyTable> {
    const book = BookHandler.parse(buffer);

    const table = await ScheduleMetadataReader.from(book).read();

    return table;
  }
}
