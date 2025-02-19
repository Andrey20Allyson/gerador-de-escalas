import React, { PropsWithChildren, createContext, useContext } from "react";
import { FormController, OnSubmitHandler } from "./form-controller";

const formContext = createContext<FormController | null>(null);

export interface FormProviderProps extends PropsWithChildren {
  onSubmit?: OnSubmitHandler;
}

export function FormProvider(props: FormProviderProps) {
  const { children, onSubmit } = props;

  const controller = new FormController();

  if (onSubmit) controller.subscribe(onSubmit);

  return (
    <formContext.Provider value={controller}>{children}</formContext.Provider>
  );
}

export function useFormController() {
  const controller = useContext(formContext);
  if (controller === null)
    throw new Error(`Can't use FormController outside a FormProvider`);

  return controller;
}

export * from "./form-controller";
export * from "./form-field";
