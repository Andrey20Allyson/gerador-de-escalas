import React, { useRef } from 'react';
import { useStage } from '../contexts/stages';
import { HeaderLabel } from '../pages/Generator/WorkerEditionStage.styles';
import { TableSheetSelect, TableSheetSelectState } from './TableSheetSelect';

export interface LoadTableFormData {
  ordinaryTable: TableSheetSelectState;
  tableToEdit: TableSheetSelectState;
}

export interface LoadTableStageProps {
  title: string;
  onSubmit?: (data: LoadTableFormData) => boolean | Promise<boolean>;
}

export function LoadTableStage(props: LoadTableStageProps) {
  const tableToEditStateRef = useRef<TableSheetSelectState>();
  const ordinaryTableStateRef = useRef<TableSheetSelectState>();
  const { next } = useStage();

  async function handleSubmit() {
    const tableToEditState = tableToEditStateRef.current;
    const ordinaryTableState = ordinaryTableStateRef.current;

    if (!tableToEditState || !ordinaryTableState) return alert('Algum(s) dos campos obrigatórios não foram preenchidos');

    const result = props.onSubmit?.({
      ordinaryTable: ordinaryTableState,
      tableToEdit: tableToEditState,
    }) ?? true;

    const success = result instanceof Promise ? await result : result;

    if (success) next();
  }

  return (
    <>
      <HeaderLabel>{props.title}</HeaderLabel>
      <div className="form-body">
        <TableSheetSelect
          fileInputTitle='Escala Ordinária'
          selectTitle='Nome da Aba'
          onChange={state => ordinaryTableStateRef.current = state}
        />
        <TableSheetSelect
          fileInputTitle='Escala Para Editar'
          selectTitle='Nome da Aba'
          onChange={state => tableToEditStateRef.current = state}
        />
      </div>
      <input type='button' value='Proximo' onClick={handleSubmit} />
    </>
  )
}