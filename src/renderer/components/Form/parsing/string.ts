import { Result } from "./utils";
import { ValueParser } from "./value-parser";

export class StringParser extends ValueParser<unknown, string> {
  parse(value: unknown): Result<string> {
    switch (typeof value) {
      case "string":
        return Result.ok(value);
      case "number":
      case "bigint":
      case "boolean":
      case "symbol":
        return Result.ok(value.toString());
      case "undefined":
        return Result.ok("undefined");
      case "object":
      case "function":
        if (value instanceof Date) return Result.ok(value.toString());

        try {
          return Result.ok(JSON.stringify(value));
        } catch (err) {
          if (err instanceof Error) {
            return Result.error(err.message);
          } else {
            return Result.error(String(err));
          }
        }
    }
  }
}
