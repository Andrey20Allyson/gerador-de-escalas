import { Result } from "./utils";
import { ErrorMessageMapLike, ValueParser } from "./value-parser";

export class CustomParser<I, O, EMM extends ErrorMessageMapLike> extends ValueParser<I, O, EMM> {
  private _getMessage: CustomParser<I, O, EMM>['message'];
  
  constructor(
    readonly parseFunction: (value: I, getMessage: CustomParser<I, O, EMM>['message']) => Result<O>,
    errorMessageMap: EMM,
  ) {
    super(...[errorMessageMap] as keyof EMM extends never ? [] : [EMM]);

    this._getMessage = (name, ...args) => this.message(name, ...args);
  }

  parse(value: I): Result<O> {
    return this.parseFunction(value, this._getMessage);
  }
}