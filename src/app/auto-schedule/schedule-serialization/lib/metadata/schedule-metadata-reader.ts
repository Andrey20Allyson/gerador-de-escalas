import { ExtraDutyTable } from "../../../extra-duty-lib";
import { DeserializationContext } from "../../deserializers/deserialization-context";
import { JsonDeserializationStratergy } from "../../deserializers/stratergies/json-deserialization-strategy";
import { BookHandler } from "../../../xlsx-handlers";

export class ScheduleMetadataReader {
  constructor(readonly book: BookHandler) { }

  async read(): Promise<ExtraDutyTable> {
    const sheet = this.book.getSheet('__ASG_META__');
    if (sheet == null) {
      throw new Error();
    }

    const metadataString = sheet.at('A', 1).as('string').value;
    const metadataBuffer = Buffer.from(metadataString);

    const table = await DeserializationContext
      .using(JsonDeserializationStratergy)
      .deserialize(metadataBuffer);

    return table;
  }

  static from(book: BookHandler) {
    return new ScheduleMetadataReader(book);
  }
}