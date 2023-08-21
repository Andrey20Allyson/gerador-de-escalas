import React, { MutableRefObject, PropsWithChildren } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled, { css } from 'styled-components';
import { TableEditor } from '../../../app/api/table-edition';
import { hoveredBackground, normalBackground, selectedBackground } from '../../App.styles';
import { RouteState } from '../../contexts/router';
import { useTableEditor } from '../../hooks';
import { EditorRouterContext, Routes } from './context';

export interface EditorTypeSelectProps {
  tableRef?: MutableRefObject<TableEditor | null>;
}

export function EditorTypeSelectProvider(props: PropsWithChildren) {
  return (
    <EditorRouterContext.RouterProvider>
      {props.children}
    </EditorRouterContext.RouterProvider>
  );
}

export function EditorTypeSelect(props: EditorTypeSelectProps) {
  const { tableRef } = props;

  const tableResponse = useTableEditor();

  if (tableRef) {
    tableRef.current = tableResponse.status === 'success' ? tableResponse.editor : null;
  }

  return (
    <>
      {tableResponse.status === 'loading'
        ? <LoadingEditorTypeSelect />
        : tableResponse.status === 'success'
          ? <LoadedEditorTypeSelect table={tableResponse.editor} />
          : <div>Error</div>}
    </>
  );
}

export function LoadingEditorTypeSelect() {
  return (
    <StyleEditorTypeSelect>
      <section className='content'>
        <Skeleton style={{ width: '100%', height: '99%' }} />
      </section>
    </StyleEditorTypeSelect>
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
    navigate('DutyTableGrid', { table });
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

export const StyleEditorTypeSelect = styled.div`
  grid-template-columns: min-content 1fr;
  min-width: 900px;
  height: 400px;
  display: grid;
  gap: .5rem;
  border: 1px solid #0004;
  background-color: #9e9e9e;
  border-radius: .4rem;
  box-shadow: -.3rem .3rem .4rem #0002;

  &>.selector {
    padding: .3rem;
    background-color: #e2e2e2f4;
    display: flex;
    flex-direction: column;
    gap: .4rem;
    align-items: stretch;
    border-top-left-radius: .4rem;
    border-bottom-left-radius: .4rem;

    &>h2 {
      font-size: .9rem;
      margin: 0;
      margin-bottom: .2rem;
      text-align: center;
    }
  }
  
  &>.content {
    padding: .3rem;
    background-color: #e2e2e2f4;
    border-top-right-radius: .4rem;
    border-bottom-right-radius: .4rem;
  }
`;

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