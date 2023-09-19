import { BigIntParser, BigIntParserErrorMessageMap } from "./bigint";
import { DateParser, DateParserErrorMessageMap } from "./date";
import { EnumParser, EnumParserErrorMessageMap } from "./enum";
import { NumberParser, NumberParserErrorMessageMap } from "./number";
import { StringParser } from "./string";

const NUMBER_PARSER = new NumberParser({
  INVALID_STRING: `string '%s' can't be parsed to number!`,
  INVALID_TYPE: `%s can't be parsed to number!`,
});

const STRING_PARSER = new StringParser();

const DATE_PARSER = new DateParser({
  INFINITY_ERROR: `Infinity can't be parsed to date!`,
  INVALID_STRING: `string '%s' can't be parsed to date!`,
  INVALID_TYPE: `type '%s' can't be parsed to date!`,
  INVALID_NUMBER: `number %s can't be parsed to date!`,
});

const ENUM_PARSER_EMM: EnumParserErrorMessageMap = {
  DONT_IS_MEMBER_OF_ENUM: `string '%s' don't is member of enum(%s)!`,
};

const BIGINT_PARSER = new BigIntParser({
  INVALID_NUMBER: `number %s can't be parsed to bigint!`,
  INVALID_STRING: `string '%s' can't be parsed to bitint!`,
  INVALID_TYPE: `type '%s' can't be parsed to bigint!`,
});

export const parsers = {
  string: () => STRING_PARSER,
  number: (messages?: NumberParserErrorMessageMap) => messages === undefined ? NUMBER_PARSER : new NumberParser(messages),
  date: (messages?: DateParserErrorMessageMap) => messages === undefined ? DATE_PARSER : new DateParser(messages),
  bigint: (messages: BigIntParserErrorMessageMap) => messages === undefined ? BIGINT_PARSER : new BigIntParser(messages),
  enum: <U extends string, E extends readonly [U, ...U[]]>(_enum: E, messages?: EnumParserErrorMessageMap) => new EnumParser(_enum, messages ?? ENUM_PARSER_EMM),
} as const;

export * from './bigint';
export * from './date';
export * from './enum';
export * from './number';
export * from './string';
export * from './value-parser';
export * from './parser-list';
export * from './types';
export * from './utils';