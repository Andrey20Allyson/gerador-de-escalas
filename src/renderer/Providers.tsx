import React, { PropsWithChildren } from 'react';
import { DayEditionModalProvider } from './components/DayEditionModal';
import { DutySelectModalProvider } from './components/DutySelectModal';
import { EditorContext } from './components/EditorTypeSelect/context';
import { RulesModalProvider } from './components/RulesModal';
import { SaveTableModalProvider } from './components/SaveTableModal';

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