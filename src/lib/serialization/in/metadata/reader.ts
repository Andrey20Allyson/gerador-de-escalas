import { ExtraDutyTable } from "src/lib/structs";
import { JsonDeserializationStratergy } from "../impl/json-deserialization-strategy";
import { BookHandler } from "src/utils/xlsx-handlers";
import { Deserializer } from "../deserializer";
import { Result } from "src/utils";

export class ScheduleMetadataReader {
  readonly deserializer: Deserializer;

  constructor(readonly book: BookHandler) {
    this.deserializer = new JsonDeserializationStratergy();
  }

  async read(): Promise<ExtraDutyTable> {
    const sheet = this.getMetadataSheet();
    if (sheet == null) {
      throw new Error("Cant find metadata sheet");
    }

    const metadataString = sheet.at("A", 1).as("string").value;
    const metadataBuffer = Buffer.from(metadataString);

    const table = await this.deserializer.deserialize(metadataBuffer);

    return table;
  }

  hasMetadata() {
    const sheet = this.getMetadataSheet();

    return sheet != null;
  }

  private getMetadataSheet() {
    const sheetResult = this.book.safeGetSheet("__ASG_META__");
    const sheet = Result.optional(sheetResult);

    return sheet;
  }

  static from(book: BookHandler) {
    return new ScheduleMetadataReader(book);
  }
}
