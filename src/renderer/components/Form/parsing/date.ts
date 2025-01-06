import { Result } from "./utils";
import { ValueParser } from "./value-parser";

export type DateParserErrorMessageMap = {
  INFINITY_ERROR: string;
  INVALID_STRING: string;
  INVALID_NUMBER: string;
  INVALID_TYPE: string;
};

export class DateParser extends ValueParser<
  unknown,
  Date,
  DateParserErrorMessageMap
> {
  invalidStringError(str: string): Result.Fail {
    return Result.error(this.message("INVALID_STRING", str));
  }

  invalidNumberError(num: number): Result.Fail {
    return Result.error(this.message("INVALID_NUMBER", num.toString()));
  }

  infinityError(): Result.Fail {
    return Result.error(this.message("INFINITY_ERROR"));
  }

  static isInvalidDate(date: Date) {
    return isNaN(date.getTime());
  }

  parse(value: unknown): Result<Date> {
    switch (typeof value) {
      case "string": {
        const date = new Date(value);
        if (DateParser.isInvalidDate(date))
          return this.invalidStringError(value);

        return Result.ok(date);
      }
      case "number":
        if (!isFinite(value)) return this.infinityError();

        const date = new Date(value);
        if (DateParser.isInvalidDate(date))
          return this.invalidNumberError(value);

        return Result.ok(date);
      case "bigint":
        const number = Number(value);
        if (!isFinite(number)) return this.infinityError();

        return Result.ok(new Date(number));
      case "object":
        if (value instanceof Date) return Result.ok(value);
      case "symbol":
      case "boolean":
      case "undefined":
      case "function":
        return Result.error(this.message("INVALID_TYPE", typeof value));
    }
  }
}
