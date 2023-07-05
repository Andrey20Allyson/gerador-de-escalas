import React from 'react';
import { useStage } from '../../contexts/stages';
import { HeaderLabel } from '../Generator/WorkerEditionStage.styles';
import { TableSheetSelect } from '../../components/TableSheetSelect';

export function LoadTableStage() {
  const { next } = useStage();



  return (
    <>
      <HeaderLabel>Escolha uma escala para editar</HeaderLabel>
      <div className="form-body">
        <TableSheetSelect
          fileInputTitle='Escala Ordinária'
          selectTitle='Nome da Aba'
        />
        <TableSheetSelect
          fileInputTitle='Escala Gerada'
          selectTitle='Nome da Aba'
        />
      </div>
      <input type='button' value='Proximo' onClick={next} />
    </>
  )
}