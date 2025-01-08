import { Result } from "./utils";
import { ValueParser } from "./value-parser";

export type NumberParserErrorMessageMap = {
  INVALID_STRING: string;
  INVALID_TYPE: string;
};

export class NumberParser extends ValueParser<
  unknown,
  number,
  NumberParserErrorMessageMap
> {
  parse(value: unknown): Result<number> {
    switch (typeof value) {
      case "number":
        return Result.ok(value);
      case "string":
        const num = Number(value);
        return isNaN(num)
          ? Result.error(this.message("INVALID_STRING", value))
          : Result.ok(num);
      case "boolean":
      case "bigint":
        return Result.ok(Number(value));
      case "object":
        if (value instanceof Date) return Result.ok(value.getTime());
      case "symbol":
      case "undefined":
      case "function":
        return Result.error(this.message("INVALID_TYPE", typeof value));
    }
  }
}
