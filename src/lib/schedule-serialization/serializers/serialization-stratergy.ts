import { ExtraDutyTable } from "../../extra-duty-lib";

export interface SerializationStratergy {
  execute(table: ExtraDutyTable): Promise<Buffer>;
}
