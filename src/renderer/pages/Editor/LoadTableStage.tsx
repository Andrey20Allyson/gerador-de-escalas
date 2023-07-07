import React, { useRef } from 'react';
import { useStage } from '../../contexts/stages';
import { HeaderLabel } from '../Generator/WorkerEditionStage.styles';
import { TableSheetSelect, TableSheetSelectState } from '../../components/TableSheetSelect';

export function LoadTableStage() {
  const tableToEditStateRef = useRef<TableSheetSelectState>();
  const ordinaryTableStateRef = useRef<TableSheetSelectState>();
  const { next } = useStage();

  async function handleSubmit() {
    const tableToEditState = tableToEditStateRef.current;
    const ordinaryTableState = ordinaryTableStateRef.current;

    if (!tableToEditState || !ordinaryTableState) return alert('Algum(s) dos campos obrigatórios não foram preenchidos');

    const result = await window.api.loadEditor({
      ordinaryTable: {
        filePath: ordinaryTableState.filePath,
        sheetName: ordinaryTableState.sheetName,
      },
      tableToEdit: {
        filePath: tableToEditState.filePath,
        sheetName: tableToEditState.sheetName,
      },
    });

    if (result) {
      console.error(result);
      alert(result.message);
    } else {
      next();
    }
  }

  return (
    <>
      <HeaderLabel>Escolha uma escala para editar</HeaderLabel>
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