import React, { MutableRefObject } from 'react';
import Skeleton from 'react-loading-skeleton';
import styled, { css } from 'styled-components';
import { TableEditor } from '../../../app/api/table-edition';
import { hoveredBackground, normalBackground, selectedBackground } from '../../App.styles';
import { InferRoutes, RouteState, createRouteState, createRouterContext } from '../../contexts/router';
import { useTableEditor } from '../../hooks';
import { DutyTableGrid } from '../DutyTableGrid';
import { WorkerList } from '../WorkerList';

function NotSelected() {
  return <Skeleton width='100%' height='99%' />
}

export const EditorSelection = createRouterContext({
  DutyTableGrid,
  NotSelected,
  WorkerList,
}, 'NotSelected', {});

type Routes = InferRoutes<typeof EditorSelection>;

export interface EditorTypeSelectProps {
  tableRef?: MutableRefObject<TableEditor | null>;
}

export function EditorTypeSelect(props: EditorTypeSelectProps) {
  const { tableRef } = props;

  const tableResponse = useTableEditor();

  if (tableRef) {
    tableRef.current = tableResponse.status === 'success' ? tableResponse.editor : null;
  }

  return (
    <EditorSelection.RouterProvider>
      {tableResponse.status === 'loading' ? <LoadingEditorTypeSelect /> : tableResponse.status === 'success' ? <LoadedEditorTypeSelect table={tableResponse.editor} /> : <div>Error</div>}
    </EditorSelection.RouterProvider>
  );
}

export function LoadingEditorTypeSelect() {
  return (
    <StyleEditorTypeSelect>
      <section className='selector'>
        <Skeleton width='80px' height='1.3rem' count={10} />
      </section>
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
  const navigate = EditorSelection.useNavigate();
  const route = EditorSelection.useRoute();

  if (route.is('NotSelected')) {
    navigate('DutyTableGrid', { table });
  }

  return (
    <StyleEditorTypeSelect>
      <section className='selector'>
        <h2>Editores</h2>
        <EditorTypeButton title='Calendário' route={createRouteState('DutyTableGrid', { table })} />
        <EditorTypeButton title='Lista' route={createRouteState('WorkerList', { table })} />
      </section>
      <section className='content'>
        <EditorSelection.Router />
      </section>
    </StyleEditorTypeSelect>
  );
}

export interface EditorTypeButtonProps {
  route: RouteState<Routes>;
  title: string;
}

export function EditorTypeButton(props: EditorTypeButtonProps) {
  const navigate = EditorSelection.useNavigate();
  const actualRoute = EditorSelection.useRoute();
  const { route } = props;

  function handleSubmit() {
    navigate(route.name, route.props);
  }

  return (
    <StyledEditorTypeButton selected={route.is(actualRoute.name)} onClick={handleSubmit}>
      {props.title}
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
  background-color: #747474;
  border-radius: .4rem;
  box-shadow: -.3rem .3rem .4rem #0002;

  &>.selector {
    padding: .3rem;
    background-color: #b6b6b6f4;
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
    background-color: #b6b6b6f4;
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