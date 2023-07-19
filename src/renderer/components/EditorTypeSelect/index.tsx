import React, { createContext, useState } from 'react';
import styled from 'styled-components';

export interface EditorTypeSelectContext {
  
}

const editorTypeSelectContext = createContext<EditorTypeSelectContext | null>(null);

export function EditorTypeSelectProvider() {
  const [] = useState('');

  return (
    <editorTypeSelectContext.Provider value={null}>

    </editorTypeSelectContext.Provider>
  );
}

export function EditorTypeSelect() {
  return (
    <StyleEditorTypeSelect>
      <section className='selector'>

      </section>
      <section className='content'>

      </section>
    </StyleEditorTypeSelect>
  );
}

export interface EditorTypeButtonProps {
  name: string;
  component: () => React.JSX.Element;
}

export function EditorTypeButton(props: EditorTypeButtonProps) {
  return (
    <StyledEditorTypeButton>

    </StyledEditorTypeButton>
  );
}

export const StyleEditorTypeSelect = styled.div`
  grid-template-columns: 5rem 1fr;
  display: grid;
`;

export const StyledEditorTypeButton = styled.button`

`; 