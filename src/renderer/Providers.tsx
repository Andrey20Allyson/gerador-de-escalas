import React, { PropsWithChildren } from 'react';
import { DayEditionModalProvider } from './components/DayEditionModal';
import { DutySelectModalProvider } from './components/DutySelectModal';
import { EditorContext } from './components/EditorTypeSelect/context';
import { RulesModalProvider } from './components/RulesModal';
import { SaveTableModalProvider } from './components/SaveTableModal';
import Redux from 'react-redux';
import { store } from './state/store';

export function Providers(props: PropsWithChildren) {
  return (
    <Redux.Provider store={store}>
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
    </Redux.Provider>
  );
}