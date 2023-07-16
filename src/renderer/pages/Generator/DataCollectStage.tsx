import React, { useState } from "react";
import { useStage } from "../../contexts/stages";
import { parseNumberOrThrow } from "../../utils";

export interface DataCollectStageState {
  filePath?: string;
  sheetName?: string;
  sheetNames?: string[];
  month?: number;
  year?: number;
}

function createSheetNameOption(sheetName: string, key: number) {
  return <option key={key} value={sheetName}>{sheetName}</option>;
}

export interface DataCollectStageErrorState {
  filePath?: string;
  sheetName?: string;
  month?: string;
  year?: string;
}

export function DataCollectStage() {
  const { next } = useStage();
  const [state, setState] = useState<DataCollectStageState>({});
  const [errorState, setErrorState] = useState<DataCollectStageErrorState>({});

  async function handleSubmit() {
    const { filePath, sheetName, month, year } = state;
    const newErrorState: DataCollectStageErrorState = {};

    if (!filePath || !sheetName || !month || !year) {
      if (!filePath) newErrorState.filePath = 'Escala do Mês é um campo obrigatório';
      if (!sheetName) newErrorState.sheetName = 'Nome da Aba é um Campo obrigatório';
      if (!month) newErrorState.month = 'Mês é um Campo obrigatório';
      if (!year) newErrorState.year = 'Mês é um Campo obrigatório';

      return setErrorState(newErrorState);
    }
// @ts-ignore
    const error = await window.api.loadData({
      sheetName,
      filePath,
      month,
      year,
    });

    if (error) {
      Object.setPrototypeOf(error, Error.prototype);
      alert(error);
    } else {
      next();
    }
  }

  async function handleFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const filePath = ev.currentTarget.files?.item(0)?.path;
    if (!filePath) return;
// @ts-ignore
    const sheetNames = await window.api.getSheetNames(filePath);
    const sheetName = sheetNames.at(0);

    setState({ ...state, filePath, sheetNames, sheetName });
  }

  function handleSheetNameChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    setState({
      ...state,
      sheetName: ev.currentTarget.value,
    });
  }

  function handleMonthChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const [stringYear, stringMonth]: (string | undefined)[] = ev.currentTarget.value.split('-');
    if (!stringYear) return;
    if (!stringMonth) return;

    const year = parseNumberOrThrow(stringYear);
    const month = parseNumberOrThrow(stringMonth) - 1;

    setState({ ...state, month, year });
  }

  const message = errorState.filePath ?? errorState.sheetName ?? errorState.month;

  if (message) {
    alert(message);
    setErrorState({});
  }

  return (
    <>
      <div className="form-body">
        <label className="mandatory">Escala do Mês</label>
        <input type="file" onChange={handleFileChange} />
        <label className="mandatory">Nome da Aba</label>
        <select onChange={handleSheetNameChange}>{
          state.sheetNames && state.sheetNames.map(createSheetNameOption)
        }</select>
        <label className="mandatory">Mês</label>
        <input onChange={handleMonthChange} type="month" />
      </div>
      <input type="submit" onClick={handleSubmit} className="submit-button" value="Proximo" />
    </>
  )
}