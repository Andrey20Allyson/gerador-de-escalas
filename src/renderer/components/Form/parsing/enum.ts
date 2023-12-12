import { Result } from "./utils";
import { ValueParser } from "./value-parser";

export type EnumParserErrorMessageMap = {
  DONT_IS_MEMBER_OF_ENUM: string,
};

export class EnumParser<U extends string, E extends readonly [U, ...U[]]> extends ValueParser<string, E[number], EnumParserErrorMessageMap> {
  private enumString: string;

  constructor(private readonly _enum: E, errorMessageMap: EnumParserErrorMessageMap) {
    super(errorMessageMap);

    this.enumString = this._enum.join(' | ');
  }

  parse(value: string): Result<E[number]> {
    return this._enum.includes(value as E[number])
      ? Result.ok(value as E[number])
      : Result.error(this.message('DONT_IS_MEMBER_OF_ENUM', value, this.enumString))
  }
}