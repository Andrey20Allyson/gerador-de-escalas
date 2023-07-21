import React, { PropsWithChildren } from 'react';
import { DutySelectModalProvider } from './components/DutySelectModal';

export function Providers(props: PropsWithChildren) {
  return (
    <DutySelectModalProvider>
      {props.children}
    </DutySelectModalProvider>
  );
}