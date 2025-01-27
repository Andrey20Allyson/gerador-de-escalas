import { ExtraDutyTable } from "src/lib/structs";
import { JsonDeserializer } from "../impl/json-deserializer";
import { BookHandler } from "src/utils/xlsx-handlers";
import { DeserializationResult, Deserializer } from "../deserializer";
import { Result } from "src/utils";

export class MetadataNotFoundError extends Error {
  constructor() {
    super(
      "Expected withOutMetadataConfig when deserializing a ordinary table without metadata",
    );
  }
}

export class ScheduleMetadataReader {
  readonly deserializer: Deserializer;

  constructor(readonly book: BookHandler) {
    this.deserializer = new JsonDeserializer();
  }

  async read(): Promise<DeserializationResult> {
    const sheet = this.getMetadataSheet();
    if (sheet == null) {
      throw new MetadataNotFoundError();
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
