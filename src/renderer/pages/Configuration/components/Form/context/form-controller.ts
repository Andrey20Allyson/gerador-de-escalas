import { AtonHook } from "../../../../../utils/state";
import { FormField, FormFieldValue } from "./form-field";

export type FormControllerData = Partial<Record<string, FormFieldValue>>;
export type FormControllerErrors = Partial<Record<string, string>>;
export type OnSubmitHandler = (controller: FormController) => void;
export type MapType<A extends readonly [] | any[], B> = {
  [K in keyof A]: B
};

export class FormController {
  readonly errors = new AtonHook<FormControllerErrors>({});
  readonly data = new AtonHook<FormControllerData>({});
  private _onSubmitHandlers: OnSubmitHandler[] = [];

  field(name: string): FormField {
    return new FormField(this, name);
  }

  fields<A extends readonly [] | string[]>(fieldNames: A): MapType<A, FormField> {
    return fieldNames.map(name => this.field(name)) as MapType<A, FormField>;
  }

  subscribe(handler: OnSubmitHandler) {
    this._onSubmitHandlers.push(handler);
  }

  submit() {
    for (const handler of this._onSubmitHandlers) {
      handler(this);
    }
  }
}

export interface FormConsumer {
  field(name: string): FormField;
}