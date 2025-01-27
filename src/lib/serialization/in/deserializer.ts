import { ExtraDutyTable } from "src/lib/structs";
import { ScheduleFileInfo } from "..";

export interface DeserializationResult {
  readonly fileInfo: ScheduleFileInfo;
  readonly schedule: ExtraDutyTable;
}

export interface Deserializer {
  deserialize(buffer: Buffer): Promise<DeserializationResult>;
}
