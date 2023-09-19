import { ParserList } from "./parser-list";
import { ParseStackable, ParserLike } from "./types";
import { Result } from "./utils";

export type ErrorMessageMapLike = Record<string, string>;

export abstract class ValueParser<I, O, EMM extends ErrorMessageMapLike = {}> implements ParserLike<I, O>, ParseStackable<I, O> {
  constructor(...args: keyof EMM extends never ? [] : [errorMessageMap: EMM]);
  constructor(
    private readonly _errorMessageMap: Readonly<EMM> = {} as EMM,
  ) { }

  message(name: keyof EMM, ...args: string[]): string {
    let str: string = this._errorMessageMap[name];

    let count = 0;

    for (let i = 0; i < args.length; i++) {
      const searchString = `$${i}`;
      const replaceString = args.at(i);
      if (replaceString === undefined) break;

      let slices: string[] = [];
      let startIndex = 0;
      
      while (true) {
        count++;
        if (count >= 2000) throw new Error(`loop limit exceded!`);
        const lastStartIndex = startIndex;
        startIndex = str.indexOf(searchString, startIndex);
        
        if (startIndex === -1) {
          const slice = str.slice(lastStartIndex);

          slices.push(slice);
          break;
        }

        slices.push(
          str.slice(lastStartIndex, startIndex),
          replaceString,
        );

        startIndex = startIndex + searchString.length;
      }

      str = slices.join('');
    }

    return str;
  }

  error(name: keyof EMM, ...args: string[]): Result.Fail {
    return Result.error(this.message(name, ...args));
  }

  ok<V>(value: V): Result.Success<V> {
    return Result.ok(value);
  }

  then<NewOut>(parser: ParserLike<O, NewOut>): ParserList<I, NewOut> {
    return new ParserList(this, parser);
  }

  abstract parse(value: I): Result<O>;
}
