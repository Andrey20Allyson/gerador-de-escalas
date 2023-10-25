import { ParseStackable, ParserLike } from "./types";
import { Result } from "./utils";

export class ParserList<I, O> implements ParserLike<I, O>, ParseStackable<I, O> {
  constructor(
    private entry: ParserLike<I, unknown>,
    private end: ParserLike<unknown, O>,
    private middle: ParserLike<unknown, unknown>[] = [],
  ) { }

  then<NewOut>(parser: ParserLike<O, NewOut>): ParserList<I, NewOut> {
    const middle = [...this.middle, this.end];

    return new ParserList(this.entry, parser, middle);
  }

  parse(value: I): Result<O> {
    let result = this.entry.parse(value);
    if (result.type === 'error') return result;

    for (const midlleParser of this.middle) {
      result = midlleParser.parse(result.value);
      if (result.type === 'error') return result;
    }

    return this.end.parse(result.value);
  }
}