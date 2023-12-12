import React, { PropsWithChildren } from 'react';
import * as Redux from 'react-redux';
import { DayEditionModalProvider } from './components/DayEditionModal';
import { DutySelectModalProvider } from './components/DutySelectModal';
import { RulesModalProvider } from './components/RulesModal';
import { SaveTableModalProvider } from './components/SaveTableModal';
import { store } from './state/store';
import { EditorRouterContext } from './components/EditorTypeSelect/context';

export function Providers(props: PropsWithChildren) {
  return (
    <Redux.Provider store={store}>
      <EditorRouterContext.RouterProvider>
        <RulesModalProvider>
          <SaveTableModalProvider>
            <DutySelectModalProvider>
              <DayEditionModalProvider>
                {props.children}
              </DayEditionModalProvider>
            </DutySelectModalProvider>
          </SaveTableModalProvider>
        </RulesModalProvider>
      </EditorRouterContext.RouterProvider>
    </Redux.Provider>
  );
}