import { ExtraDutyTable } from "../../extra-duty-lib";
import { ClassLike } from "../../../utils/types";
import { DeserializationStratergy } from "./deserialization-stratergy";

export class DeserializationContext {
  private _stratergy?: DeserializationStratergy;

  constructor() {}

  setStratergy(stratergy: DeserializationStratergy): void {
    this._stratergy = stratergy;
  }

  deserialize(buffer: Buffer): Promise<ExtraDutyTable> {
    if (this._stratergy == null) {
      throw new Error(
        `Stratergy hasn't initialized yet, please set a stratergy`,
      );
    }

    return this._stratergy.execute(buffer);
  }

  static using(
    stratergy: DeserializationStratergy | ClassLike<DeserializationStratergy>,
  ) {
    let stratergyInstance =
      typeof stratergy === "function" ? new stratergy() : stratergy;

    const context = new DeserializationContext();

    context.setStratergy(stratergyInstance);

    return context;
  }
}
