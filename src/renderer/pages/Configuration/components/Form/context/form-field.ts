import { ChangeEvent } from 'react';
import { FormController } from "./form-controller";
import { ParserLike, Result } from './parsing';
import { ValuePipe } from './value-pipe';

export type FormFieldValue =
  | string
  | number
  | Date;

export type ObjectWithValue = {
  value: string;
};

export class FormField implements Result.OnReusltError {
  constructor(
    private readonly controller: FormController,
    readonly name: string,
  ) { }

  onResultError(message: string): void {
    this.warn(message);
  }

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

  pipe<R extends FormFieldValue>(parser: ParserLike<FormFieldValue, R>): ValuePipe<R> {
    return new ValuePipe(this, this.value()).pipe(parser);
  }
}