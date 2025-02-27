export type OnPromiseFinish = (error: any, result: any) => void;
export type PromiseCanceller = (
  promise: CancellablePromise<any>,
) => OnPromiseFinish | void;
export type CancellablePromiseExecutor<T> = (
  resolve: (value: T | PromiseLike<T>) => void,
  reject: (reason?: any) => void,
) => OnPromiseFinish | void;

export class CancellablePromise<T = any> implements Promise<T> {
  private readonly _inner: Promise<T>;
  private _onFinish: OnPromiseFinish[] = [];
  private _reject!: (reason: any) => void;
  private _isCancelled: boolean = false;
  private _isFinished: boolean = false;

  constructor(executor: CancellablePromiseExecutor<T>) {
    this._inner = new Promise((res, rej) => {
      this._reject = rej;

      const onCancel = executor(
        (value) => {
          this._finish(null, value);

          return res(value);
        },
        (reason) => this.cancel(reason),
      );

      if (onCancel) {
        this._onFinish.push(onCancel);
      }
    });
  }

  cancel(reason?: any) {
    if (this.isCancelled()) {
      return;
    }

    this._isCancelled = true;

    this._finish(reason, null);

    this._reject(reason);
  }

  private _finish(error: any, result: any) {
    if (this._isFinished) {
      return;
    }

    this._isFinished = true;

    for (const listener of this._onFinish) {
      listener(error, result);
    }
  }

  use(canceller: PromiseCanceller): this {
    const onCancel = canceller(this);

    if (onCancel != null) {
      this._onFinish.push(onCancel);
    }

    return this;
  }

  isCancelled() {
    return this._isCancelled;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | null
      | undefined,
    onrejected?:
      | ((reason: any) => TResult2 | PromiseLike<TResult2>)
      | null
      | undefined,
  ): Promise<TResult1 | TResult2> {
    return this._inner.then(onfulfilled, onrejected);
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: any) => TResult | PromiseLike<TResult>)
      | null
      | undefined,
  ): Promise<T | TResult> {
    return this._inner.catch(onrejected);
  }

  finally(onfinally?: (() => void) | null | undefined): Promise<T> {
    return this._inner.finally(onfinally);
  }

  get [Symbol.toStringTag]() {
    return this._inner[Symbol.toStringTag];
  }
}

export function timeoutCanceller(ms: number): PromiseCanceller {
  return (promise) => {
    const timeout = setTimeout(() => {
      console.log("cancel by timeout");
      promise.cancel(new Error("Timeout exceeded"));
    }, ms);

    return () => {
      clearTimeout(timeout);
    };
  };
}
