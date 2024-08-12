import { ExtraDutyTable } from "../../extra-duty-lib";
import { DeserializationStratergy } from "./deserialization-stratergy";

export class DeserializationContext {
  constructor(private stratergy: DeserializationStratergy) { }

  setStratergy(stratergy: DeserializationStratergy): void {
    this.stratergy = stratergy;
  }

  deserialize(buffer: Buffer): Promise<ExtraDutyTable> {
    return this.stratergy.execute(buffer);
  }
}