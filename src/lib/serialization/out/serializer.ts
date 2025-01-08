import { ExtraDutyTable } from "src/lib/structs";

export interface Serializer {
  serialize(table: ExtraDutyTable): Promise<Buffer>;
}
