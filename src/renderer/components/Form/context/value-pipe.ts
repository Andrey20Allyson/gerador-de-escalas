import { FormField } from "./form-field";
import { ParserLike, Result } from "../parsing";

export class ValuePipe<T> {
  constructor(
    private _field: FormField,
    private _result: Result<T>,
  ) {}

  value(): Result<T> {
    return this._result;
  }

  /**
   * @throws If result returns a error.
   */
  unwrap(listener?: Result.ResultErrorListener): T {
    return this._result.onError(this._field).unwrap(listener);
  }

  pipe<R>(parser: ParserLike<T, R>): ValuePipe<R> {
    const result = this.value();
    if (result.type === "error") return this as any;

    return new ValuePipe(this._field, parser.parse(result.value));
  }
}
