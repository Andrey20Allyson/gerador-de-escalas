import { ExtraDutyTable } from "src/lib/structs";
import { Serializer } from "../serializer";

export class OrdinarySerializer implements Serializer {
  constructor() {}

  serialize(table: ExtraDutyTable): Promise<Buffer> {
    throw new Error("err");
  }
}
