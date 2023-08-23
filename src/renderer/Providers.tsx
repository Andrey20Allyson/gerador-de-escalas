import React, { PropsWithChildren } from 'react';
import { DutySelectModalProvider } from './components/DutySelectModal';
import { RulesModalProvider } from './components/RulesModal';
import { SaveTableModalProvider } from './components/SaveTableModal';
import { EditorContext } from './components/EditorTypeSelect/context';
import { DayEditionModalProvider } from './components/DayEditionModal';

export function Providers(props: PropsWithChildren) {
  return (
    <RulesModalProvider>
      <SaveTableModalProvider>
        <EditorContext.Provider>
          <DutySelectModalProvider>
            <DayEditionModalProvider>
              {props.children}
            </DayEditionModalProvider>
          </DutySelectModalProvider>
        </EditorContext.Provider>
      </SaveTableModalProvider>
    </RulesModalProvider>
  );
}