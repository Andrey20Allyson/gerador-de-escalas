import { Result } from "./utils";

export interface ParseStackable<I, O> {
  then<NewOut>(parser: ParserLike<O, NewOut>): ParserLike<I, NewOut>;
}

export interface ParserLike<I, O> {
  parse(value: I): Result<O>;
}