import { Result, ValueParser } from ".";

export type BooleanParserEMM = {
  INVALID_TYPE: string;
};

export class BooleanParser extends ValueParser<unknown, boolean, BooleanParserEMM> {
  parse(value: unknown): Result<boolean> {
    switch (typeof value) {
      case "boolean":
        return this.ok(value);
      case "bigint":
      case "number":
        return this.ok(Boolean(value));
      case "string":
      case "symbol":
      case "undefined":
      case "object":
      case "function":
        return this.error('INVALID_TYPE', typeof value);
    }
  }
}