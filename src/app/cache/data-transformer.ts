import { PromiseOrNot } from "./types";

export type BufferReducerFunction = (data: Buffer) => PromiseOrNot<Buffer>;
export interface BufferReducerObject {
  reduce(data: Buffer): PromiseOrNot<Buffer>;
}

export type BufferReducer =
  | BufferReducerFunction
  | BufferReducerObject;

export class DataTransformer {
  constructor(
    readonly reducers: BufferReducer[] = [],
  ) { }

  append(reducer: BufferReducer) {
    this.reducers.push(reducer);
  }

  async transform(data: Buffer): Promise<Buffer> {
    let output = data;

    for (const reducer of this.reducers) {
      if (typeof reducer === 'function') {
        output = await reducer(output);
      } else {
        output = await reducer.reduce(output);
      }
    }

    return output;
  }

  static from(middleWare: BufferReducer | BufferReducer[]) {
    if (middleWare instanceof Array) {
      return new DataTransformer(middleWare);
    }

    return new DataTransformer([middleWare]);
  }
}