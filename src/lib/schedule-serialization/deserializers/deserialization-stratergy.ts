import { ExtraDutyTable } from "../../extra-duty-lib";

export interface DeserializationStratergy {
  execute(buffer: Buffer): Promise<ExtraDutyTable>;
}
