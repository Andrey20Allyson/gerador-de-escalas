import { describe, expect, test } from 'vitest';
import { ValueParser } from './value-parser';
import { Result } from './utils';
import { parsers } from '.';

export class TestParser extends ValueParser<string, number, { MY_MESSAGE: string }> {
  constructor() {
    super({
      MY_MESSAGE: `string '$0' can't be parsed to $1!`,
    });
  }

  parse(value: string): Result<number> {
    const result = parsers.number().parse(value);

    if (result.type === 'error') return this.error('MY_MESSAGE', value, 'number');

    return result;
  }
}

describe(ValueParser, () => {
  test(`#message('MY_MESSAGE', <value>, 'number') shold return "string '<value>' can't be parsed to number!"`, () => {
    const parser = new TestParser();

    const value = 'John Due';

    const message = parser.message('MY_MESSAGE', value, 'number');

    expect(message).toStrictEqual(`string '${value}' can't be parsed to number!`);
  });
});