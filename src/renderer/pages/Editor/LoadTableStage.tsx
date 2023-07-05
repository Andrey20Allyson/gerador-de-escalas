import React from 'react';
import { useStage } from '../../contexts/stages';
import { HeaderLabel } from '../Generator/WorkerEditionStage.styles';

export function LoadTableStage() {
  const { next } = useStage();

  function handleFileChange() {

  }

  return (
    <>
      <HeaderLabel>Escolha uma escala para editar</HeaderLabel>
      <div className="form-body">
        <label className="mandatory">Escala Ordinária</label>
        <input type="file" onChange={handleFileChange} />
        <label className="mandatory">Escala Gerada</label>
        <input type="file" onChange={handleFileChange} />
      </div>
      <input type='button' value='Proximo'/>
    </>
  )
}