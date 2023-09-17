import { ZodSchema, z } from "zod";
import { AtonHook, FormControllerData } from "./form-controller";

export type FormFieldValue =
  | string
  | number
  | Date;

export const PARSE_FAIL = Symbol();
export const INEXISTENT_FIELD = Symbol();

export class FormField {
  constructor(
    readonly state: AtonHook<FormControllerData>,
    readonly name: string,
  ) { }

  get(): FormFieldValue | typeof INEXISTENT_FIELD {
    return this.state.get()[this.name] ?? INEXISTENT_FIELD;
  }

  set(value: FormFieldValue): this {
    this.state.set(state => ({
      ...state,
      [this.name]: value,
    }));

    return this;
  }

  asEnum<K extends string>(values: K[]): K | typeof INEXISTENT_FIELD | typeof PARSE_FAIL {
    const value = this.get();
    if (value === INEXISTENT_FIELD) return INEXISTENT_FIELD;
    if (typeof value !== 'string') return PARSE_FAIL;

    return values.includes(value as K) ? value as K : PARSE_FAIL;
  }

  asString(): string | typeof INEXISTENT_FIELD {
    const value = this.get();
    if (value === INEXISTENT_FIELD) return INEXISTENT_FIELD;

    switch (typeof value) {
      case "string":
        return value;
      default:
        return value.toString();
    }
  }

  asNumber(): number | typeof INEXISTENT_FIELD | typeof PARSE_FAIL {
    const value = this.get();
    if (value === INEXISTENT_FIELD) return INEXISTENT_FIELD;

    switch (typeof value) {
      case 'string':
        const num = Number(value);
        return isNaN(num) ? PARSE_FAIL : num;
      case 'number':
        return value;
      case 'object':
        return value.getTime();
    }
  }

  asBigInt(): bigint | typeof INEXISTENT_FIELD | typeof PARSE_FAIL {
    const value = this.get();
    if (value === INEXISTENT_FIELD) return INEXISTENT_FIELD;

    switch (typeof value) {
      case 'number':
      case 'string':
        try {
          return BigInt(value);
        } catch {
          return PARSE_FAIL;
        }
      case 'object':
        return BigInt(value.getTime());
    }
  }

  asDate(): Date | typeof INEXISTENT_FIELD | typeof PARSE_FAIL {
    const value = this.get();
    if (value === INEXISTENT_FIELD) return INEXISTENT_FIELD;

    switch (typeof value) {
      case 'string':
        const num = Number(value);

        return isNaN(num) ? PARSE_FAIL : new Date(num);
      case 'number':
        return new Date(value);
      case 'object':
        return value;
    }
  }

  static isValid<T>(
    value:
      | T
      | typeof PARSE_FAIL
      | typeof INEXISTENT_FIELD
  ): value is T {
    return value !== PARSE_FAIL && value !== INEXISTENT_FIELD;
  }
}