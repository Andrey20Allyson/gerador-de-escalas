import { ChangeEvent } from 'react';
import { FormController } from "./form-controller";
import { ParserLike, Result } from './parsing';
import { ValuePipe } from './value-pipe';

export type AttrNameThatTypeExtends<O, T> = {
  [K in keyof O]: O[K] extends T ? K : never;
}[keyof O];

export type FormFieldValue =
  | string
  | number
  | boolean
  | Date;

export type ObjectWithValue = {
  value: string;
};

export type ObjectWithCheck = {
  checked: boolean;
};

export interface InputHandler<E> {
  handleRef(ref: E | null): void;
  handleChange(event: ChangeEvent<E>): void;
}

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
      const error = Result.error('This field hasn\'t initialized!');
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
    this.clearError();

    this.controller.data.set(state => {
      if (this.get() !== value) this.clearError();
      
      return {
        ...state,
        [this.name]: value,
      };
    });

    return this;
  }

  error() {
    return this.controller.errors.get()[this.name];
  }

  clearError() {
    this.controller.errors.set(errors => {
      const { [this.name]: _, ...rest } = errors;

      return { ...rest };
    });
  }

  warn(message: string) {
    this.controller.errors.set(errors => ({
      ...errors,
      [this.name]: message,
    }));
  }

  inputHandler(): InputHandler<ObjectWithValue> {
    return this.handlerTo('value');
  }

  checkboxHandler(): InputHandler<ObjectWithCheck> {
    return this.handlerTo('checked');
  }

  handlerTo<E extends object>(attr: Exclude<AttrNameThatTypeExtends<E, FormFieldValue>, keyof EventTarget>): InputHandler<E> {
    return {
      handleChange: ev => this.set(ev.currentTarget[attr] as FormFieldValue),
      handleRef: ref => ref !== null && !this.exist() && this.set(ref[attr] as FormFieldValue),
    };
  }

  pipe<R extends FormFieldValue>(parser: ParserLike<FormFieldValue, R>): ValuePipe<R> {
    return new ValuePipe(this, this.value()).pipe(parser);
  }
}
