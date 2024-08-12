import { ExtraDutyTable } from "../../extra-duty-lib";
import { SerializationStratergy } from "./serialization-stratergy";

export class SerializationContext {
  constructor(private stratergy: SerializationStratergy) { }

  setStratergy(stratergy: SerializationStratergy): void {
    this.stratergy = stratergy;
  }

  serialize(table: ExtraDutyTable): Promise<Buffer> {
    return this.stratergy.execute(table);
  }
}