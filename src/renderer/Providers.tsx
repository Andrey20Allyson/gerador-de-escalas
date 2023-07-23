import React, { PropsWithChildren } from 'react';
import { DutySelectModalProvider } from './components/DutySelectModal';
import { SaveTableModalProvider } from './components/SaveTableModal';

export function Providers(props: PropsWithChildren) {
  return (
    <SaveTableModalProvider>
      <DutySelectModalProvider>
        {props.children}
      </DutySelectModalProvider>
    </SaveTableModalProvider>
  );
}