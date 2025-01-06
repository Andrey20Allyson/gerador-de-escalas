import { useState } from "react";

export type SetterParam<T> = T | ((oldValue: T) => T);

export class AtonHook<T> {
  private _setter: (value: SetterParam<T>) => void;
  private readonly _value: T;

  constructor(initialValue: T) {
    const [value, setter] = useState<T>(initialValue);

    this._setter = setter;
    this._value = value;
  }

  set(value: SetterParam<T>): this {
    this._setter(value);

    return this;
  }

  get() {
    return this._value;
  }
}
