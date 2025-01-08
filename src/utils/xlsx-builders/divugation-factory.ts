import { TableFactory, TableFactoryOptions } from ".";
import { ExtraDutyTable } from "src/lib/structs";
import { serializeTableToDivugation } from "./divugation-factory.utils";

export class DivugationTableFactory implements TableFactory {
  async generate(
    table: ExtraDutyTable,
    options: TableFactoryOptions,
  ): Promise<Buffer> {
    return serializeTableToDivugation(table, options.sheetName);
  }
}
