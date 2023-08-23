import React, { PropsWithChildren } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled, { css } from 'styled-components';
import { TableEditor } from '../../../app/api/table-edition';
import { hoveredBackground, normalBackground, selectedBackground } from '../../App.styles';
import { RouteState } from '../../contexts/router';
import { EditorContext, EditorRouterContext, Routes } from './context';

export function EditorTypeSelect() {
  const table = EditorContext.useEditor();

  return table
    ? <LoadedEditorTypeSelect table={table} />
    : <LoadingEditorTypeSelect />
}

export function LoadingEditorTypeSelect() {
  return (
    <section className='content'>
      <Skeleton style={{ width: '100%', height: '99%' }} />
    </section>
  );
}

export interface LoadedEditorTypeSelectProps {
  table: TableEditor;
}

export function LoadedEditorTypeSelect(props: LoadedEditorTypeSelectProps) {
  const { table } = props;
  const navigate = EditorRouterContext.useNavigate();
  const route = EditorRouterContext.useRoute();

  if (route.is('NotSelected')) {
    navigate('WorkerList', { table });
  }

  return <EditorRouterContext.Router />;
}

export interface EditorTypeOptionProps extends PropsWithChildren {
  route: RouteState<Routes>;
}

export function EditorTypeOption(props: EditorTypeOptionProps) {
  const navigate = EditorRouterContext.useNavigate();
  const actualRoute = EditorRouterContext.useRoute();
  const { route } = props;

  function handleSubmit() {
    navigate(route.name, route.props);
  }

  return (
    <StyledEditorTypeButton selected={route.is(actualRoute.name)} onClick={handleSubmit}>
      {props.children}
    </StyledEditorTypeButton>
  );
}

export interface StyledEditorTypeButtonProps {
  selected?: boolean;
}

export const buttonColorStyle = css<StyledEditorTypeButtonProps>`
  ${props => props.selected ? selectedBackground : normalBackground}
  transition: background-color 200ms, color 200ms;
  
  &:hover {
    ${props => props.selected ? selectedBackground : hoveredBackground}
  }
`;

export const StyledEditorTypeButton = styled.button<StyledEditorTypeButtonProps>`
  font-weight: bold;
  border: 1px solid #0001;
  border-radius: .2rem;
  cursor: pointer;
  outline: none;
  font-size: .9rem;
  --shadow-spread: .1rem;
  box-shadow:
    calc(var(--shadow-spread) * -1) calc(var(--shadow-spread) *  1) .1rem #0003,
    calc(var(--shadow-spread) *  1) calc(var(--shadow-spread) * -1) .1rem #fff4;
  ${buttonColorStyle}
  transition: all 200ms;

  &:active {
    --shadow-spread: .0rem;
  }
`;