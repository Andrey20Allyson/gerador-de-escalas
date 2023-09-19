import { ParseStackable, ParserLike } from "./types";
import { Result } from "./utils";

export class ParserList<I, O> implements ParserLike<I, O>, ParseStackable<I, O> {
  constructor(
    private entry: ParserLike<I, unknown>,
    private end: ParserLike<unknown, O>,
    private midlle: ParserLike<unknown, unknown>[] = [],
  ) { }

  then<NewOut>(parser: ParserLike<O, NewOut>): ParserList<I, NewOut> {
    const midlle = [...this.midlle, this.end];

    return new ParserList(this.entry, parser, midlle);
  }

  parse(value: I): Result<O> {
    let result = this.entry.parse(value);
    if (result.type === 'error') return result;

    for (const midlleParser of this.midlle) {
      result = midlleParser.parse(result.value);
      if (result.type === 'error') return result;
    }

    return this.end.parse(result.value);
  }
}