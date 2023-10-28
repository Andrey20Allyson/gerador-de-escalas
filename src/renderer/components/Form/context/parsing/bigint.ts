import { Result } from "./utils";
import { ValueParser } from "./value-parser";

export type BigIntParserErrorMessageMap = {
  INVALID_NUMBER: string;
  INVALID_STRING: string;
  INVALID_TYPE: string;
};

export class BigIntParser extends ValueParser<unknown, bigint, BigIntParserErrorMessageMap> {
  tryParse(value: number | string | boolean | bigint) {
    try {
      return Result.ok(BigInt(value));
    } catch {
      return null;
    }
  }

  parse(value: unknown): Result<bigint> {
    switch (typeof value) {
      case "string":
        return this.tryParse(value) ?? Result.error(this.message('INVALID_STRING', value));
      case "number":
        let truncNumber = Math.trunc(value);

        return this.tryParse(truncNumber) ?? Result.error(this.message('INVALID_NUMBER', value.toString()));
      case "boolean":
        return Result.ok(BigInt(value));
      case "bigint":
        return Result.ok(value);
      case "symbol":
      case "undefined":
      case "object":
      case "function":
        return Result.error(this.message('INVALID_TYPE', typeof value));
    }
  }
}