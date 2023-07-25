import React, { PropsWithChildren } from 'react';
import { DutySelectModalProvider } from './components/DutySelectModal';
import { RulesModalProvider } from './components/RulesModal';
import { SaveTableModalProvider } from './components/SaveTableModal';

export function Providers(props: PropsWithChildren) {
  return (
    <RulesModalProvider>
      <SaveTableModalProvider>
        <DutySelectModalProvider>
          {props.children}
        </DutySelectModalProvider>
      </SaveTableModalProvider>
    </RulesModalProvider>
  );
}