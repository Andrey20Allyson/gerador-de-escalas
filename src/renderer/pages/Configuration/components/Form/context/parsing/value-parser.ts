import { ParserList } from "./parser-list";
import { ParseStackable, ParserLike } from "./types";
import { Result } from "./utils";

export abstract class ValueParser<I, O, EMM extends Record<string, string> = {}> implements ParserLike<I, O>, ParseStackable<I, O> {
  constructor(...args: keyof EMM extends never ? [] : [errorMessageMap: EMM]);
  constructor(
    private readonly _errorMessageMap: Readonly<EMM> = {} as EMM,
  ) { }

  message(name: keyof EMM, ...args: string[]) {
    let i = 0;
    return this._errorMessageMap[name].replace(/%s/g, () => args.at(i++) ?? '');
  }

  then<NewOut>(parser: ParserLike<O, NewOut>): ParserList<I, NewOut> {
    return new ParserList(this, parser);
  }

  abstract parse(value: I): Result<O>;
}
