import { ExtraDutyTable } from "../../extra-duty-lib";
import { ClassLike } from "../../utils/types";
import { SerializationStratergy } from "./serialization-stratergy";

export class SerializationContext {
  private _stratergy?: SerializationStratergy;

  constructor() { }

  setStratergy(stratergy: SerializationStratergy): void {
    this._stratergy = stratergy;
  }

  getStratergy(): SerializationStratergy {
    if (this._stratergy == null) {
      throw new Error(`Stratergy hasn't initialized yet, please set a stratergy`);
    }

    return this._stratergy;
  }

  serialize(table: ExtraDutyTable): Promise<Buffer> {
    return this.getStratergy().execute(table);
  }

  static using(stratergy: SerializationStratergy | ClassLike<SerializationStratergy>) {
    let stratergyInstance = typeof stratergy === 'function'
      ? new stratergy()
      : stratergy;

    const context = new SerializationContext();

    context.setStratergy(stratergyInstance);

    return context;
  }
}