import React from 'react';
import { useStage } from '../../contexts/stages';
import { HeaderLabel } from '../Generator/WorkerEditionStage.styles';

export function LoadTableStage() {
  const { next } = useStage();

  function handleOrdinaryFileChange() {

  }

  function handleGeneratedFileChange() {

  }

  return (
    <>
      <HeaderLabel>Escolha uma escala para editar</HeaderLabel>
      <div className="form-body">
        <label className="mandatory">Escala Ordinária</label>
        <input type="file" onChange={handleOrdinaryFileChange} />
        <label className="mandatory">Nome da Aba</label>
        <select>{}</select>
        <label className="mandatory">Escala Gerada</label>
        <input type="file" onChange={handleGeneratedFileChange} />
        <label className="mandatory">Nome da Aba</label>
        <select>{}</select>
      </div>
      <input type='button' value='Proximo'/>
    </>
  )
}