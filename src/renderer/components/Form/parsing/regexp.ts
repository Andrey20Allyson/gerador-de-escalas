import { Result } from "./utils";
import { ValueParser } from "./value-parser";

export type RegExpParserErrorMessageMap = {
  INCOMPATIBLE_STRING: string;
};

export class RegExpParser extends ValueParser<string, string, RegExpParserErrorMessageMap> {
  constructor(readonly regexp: RegExp, errorMessageMap: RegExpParserErrorMessageMap) {
    super(errorMessageMap);
  }

  parse(value: string): Result<string> {
    const matches = this.regexp.test(value);

    return matches
      ? this.ok(value)
      : this.error('INCOMPATIBLE_STRING', value, this.regexp.source);
  }
}