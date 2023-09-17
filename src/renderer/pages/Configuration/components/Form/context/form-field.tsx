import { ChangeEvent } from 'react';
import { FormController } from "./form-controller";

export type FormFieldValue =
  | string
  | number
  | Date;

export type Result<V = FormFieldValue> =
  | Result.Fail
  | Result.Success<V>;

export namespace Result {
  export type ResultBase<T> = {
    onError(listener: (message: string) => void): Result<T>;
    unwrap(): T;
  };

  export type Fail = {
    type: 'error';
    message: string;
  } & ResultBase<never>;

  export type Success<V> = {
    type: 'value';
    value: V;
  } & ResultBase<V>;

  export function ok<V>(value: V): Success<V> {
    return {
      unwrap: unwrap as ResultBase<V>['unwrap'],
      onError: onError as ResultBase<V>['onError'],
      type: 'value',
      value,
    };
  }

  export function error(message: string): Fail {
    return {
      unwrap: unwrap as ResultBase<never>['unwrap'],
      onError: onError as ResultBase<never>['onError'],
      type: 'error',
      message,
    };
  }

  function unwrap(this: Result<unknown>): unknown {
    if (this.type === 'error') throw new Error(this.message);

    return this.value;
  }

  function onError(this: Result<unknown>, listener: (message: string) => void): Result<unknown> {
    if (this.type === 'error') listener(this.message);

    return this;
  }
}

export type ObjectWithValue = {
  value: string;
};

export type Parser<I, O> = (value: I) => O;

export class ValuePipe<T> {
  constructor(
    private _result: Result<T>,
  ) { }

  value(): Result<T> {
    return this._result;
  }

  pipe<R>(parser: Parser<T, Result<R>>): ValuePipe<R> {
    const result = this.value();
    if (result.type === 'error') return this as any;

    return new ValuePipe(parser(result.value));
  }
}

export namespace ValueParsing {
  export function string(value: unknown): Result<string> {
    switch (typeof value) {
      case 'string':
        return Result.ok(value);
      case 'number':
      case 'bigint':
      case 'boolean':
      case 'symbol':
        return Result.ok(value.toString());
      case 'undefined':
        return Result.ok('undefined');
      case 'object':
      case 'function':
        if (value instanceof Date) return Result.ok(value.toString());

        try {
          return Result.ok(JSON.stringify(value));
        } catch (err) {
          if (err instanceof Error) {
            return Result.error(err.message);
          } else {
            return Result.error(String(err));
          }
        }
    }
  }

  export function number(value: unknown): Result<number> {
    switch (typeof value) {
      case 'number':
        return Result.ok(value);
      case 'string':
        const num = Number(value);
        return isNaN(num)
          ? Result.error(`string '${value}' can't be parsed to number`)
          : Result.ok(num);
      case 'boolean':
      case 'bigint':
        return Result.ok(Number(value));
      case 'object':
        if (value instanceof Date) return Result.ok(value.getTime());
      case 'symbol':
      case 'undefined':
      case 'function':
        return Result.error(`${typeof value} can't be parsed to number`);
    }
  }

  export function bigint(value: unknown): Result<bigint> {
    const numberResult = number(value);
    if (numberResult.type === 'error') return numberResult;

    return Result.ok(BigInt(Math.trunc(numberResult.value)));
  }

  export function date(value: unknown): Result<Date> {
    switch (typeof value) {
      case 'string':
      case 'number':
        const date = new Date(value);
        if (isNaN(date.getTime())) return Result.error(`value ${value} can't be parsed to date`); 

        return Result.ok(date);
      case 'bigint':
        const number = Number(value);
        if (number === Infinity) return Result.error(`Infinity can't be parsed to date`);

        return Result.ok(new Date(number))
      case 'object':
        if (value instanceof Date) return Result.ok(value);
      case 'symbol':
      case 'boolean':
      case 'undefined':
      case 'function':
        return Result.error(`${typeof value} can't be parsed to date`);
    }
  }

  export function enumFrom<U extends string, E extends readonly [U, ...U[]]>(values: E): Parser<string, Result<E[number]>> {
    return value => {
      return values.includes(value as U)
        ? Result.ok(value as U)
        : Result.error(`string '${value}' don't is a member of enum ${values.map(str => `'${str}'`).join(' | ')}`);
    };
  }
}

export class FormField {
  constructor(
    private readonly controller: FormController,
    readonly name: string,
  ) { }

  value(): Result<FormFieldValue> {
    const value = this.get();
    if (value === undefined) {
      const error = Result.error('This form hasn\'t initialized');
      console.warn(error.message);

      return error;
    }

    return Result.ok(value);
  }

  get(): FormFieldValue | undefined {
    return this.controller.data.get()[this.name];
  }

  exist(): boolean {
    return this.get() !== undefined;
  }

  set(value: FormFieldValue): this {
    this.controller.data.set(state => ({
      ...state,
      [this.name]: value,
    }));

    return this;
  }

  error() {
    return this.controller.errors.get()[this.name];
  }

  warn(message: string) {
    this.controller.errors.set(errors => ({
      ...errors,
      [this.name]: message,
    }));
  }

  createChangeHandler() {
    return (ev: ChangeEvent<ObjectWithValue>) => this.set(ev.currentTarget.value);
  }

  createRefHandler() {
    return (ref: ObjectWithValue | null) => {
      if (ref === null || this.exist()) return;

      this.set(ref.value);
    }
  }

  pipe<R extends FormFieldValue>(parser: Parser<FormFieldValue, Result<R>>): ValuePipe<R> {
    return new ValuePipe(this.value()).pipe(parser);
  }
}