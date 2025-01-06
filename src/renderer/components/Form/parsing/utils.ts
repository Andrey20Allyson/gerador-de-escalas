export type Result<V> = Result.Fail | Result.Success<V>;

export namespace Result {
  export type ErrorListenerFunction = (message: string) => void;
  export interface OnReusltError {
    onResultError(message: string): void;
  }
  export type ResultErrorListener = OnReusltError | ErrorListenerFunction;

  export type ResultBase<T> = {
    onError(listener: ResultErrorListener): Result<T>;
    /**
     * @throws If result is a error.
     */
    unwrap(listener?: ResultErrorListener): T;
  };

  export type Fail = {
    type: "error";
    message: string;
  } & ResultBase<never>;

  export type Success<V> = {
    type: "value";
    value: V;
  } & ResultBase<V>;

  export function ok<V>(value: V): Success<V> {
    return {
      unwrap: unwrap as ResultBase<V>["unwrap"],
      onError: onError as ResultBase<V>["onError"],
      type: "value",
      value,
    };
  }

  export function error(message: string): Fail {
    return {
      unwrap: unwrap as ResultBase<never>["unwrap"],
      onError: onError as ResultBase<never>["onError"],
      type: "error",
      message,
    };
  }

  function unwrap(
    this: Result<unknown>,
    listener?: ResultErrorListener,
  ): unknown {
    if (this.type === "error") {
      if (listener) this.onError(listener);

      throw new Error(this.message);
    }

    return this.value;
  }

  function onError(
    this: Result<unknown>,
    listener: ResultErrorListener,
  ): Result<unknown> {
    if (this.type === "error")
      typeof listener === "function"
        ? listener(this.message)
        : listener.onResultError(this.message);

    return this;
  }
}
