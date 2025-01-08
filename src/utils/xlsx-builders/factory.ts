import { ExtraDutyTable } from "src/lib/structs";

export interface TableFactoryOptions {
  sheetName: string;
  sortByName?: boolean;
}

export interface TableFactory {
  generate(
    table: ExtraDutyTable,
    options: TableFactoryOptions,
  ): Promise<Buffer>;
}
