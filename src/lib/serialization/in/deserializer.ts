import { ExtraDutyTable } from "src/lib/structs";

export interface Deserializer {
  deserialize(buffer: Buffer): Promise<ExtraDutyTable>;
}
