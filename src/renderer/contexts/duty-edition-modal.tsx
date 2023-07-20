import React, { PropsWithChildren, createContext, useContext, useState } from 'react';
import { DayEditionModal, DayViewModalProps } from "../components/DayEditionModal";
import { TableEditor } from '../../app/api/table-edition';

export interface DutyEditionModalContext {
  setProps(props: DayViewModalProps | undefined): void;
  props: DayViewModalProps | undefined;
}

const Context = createContext<DutyEditionModalContext | null>(null);

export function DutyEditionModalProvider(props: PropsWithChildren) {
  const [_props, setProps] = useState<DayViewModalProps>();

  return (
    <Context.Provider value={{ props: _props, setProps }}>
      {props.children}
      {_props && <DayEditionModal {..._props} />}
    </Context.Provider>
  );
}

function _useContext() {
  const ctx = useContext(Context);
  if (!ctx) throw new Error(`Can't access DutyEditionModalContext outside a DutyEditionModalProvider!`);

  return ctx;
}

interface OpenModalOptions {
  day?: number,
  duty?: number,
  onUpdate?: () => void;
}

export function useEditionModal() {
  const { props, setProps } = _useContext();

  function open(table: TableEditor, options: OpenModalOptions) {
    const { day, duty, onUpdate } = options;

    setProps({
      table,
      startDayIndex: day,
      startDutyIndex: duty,
      onUpdate,
    });
  }

  function close() {
    setProps(undefined);
  }

  return { open, close, props };
}