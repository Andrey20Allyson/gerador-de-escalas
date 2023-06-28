import React, { useState } from "react";

export interface DataCollectStageState {
  filePath?: string;
  sheetName?: string;
  sheetNames?: string[];
  month?: number;
}

function createSheetNameOption(sheetName: string, key: number) {
  return <option key={key} value={sheetName}>{sheetName}</option>;
}

export interface DataCollectStageProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface DataCollectStageErrorState {
  filePath?: string;
  sheetName?: string;
  month?: string;
}

export function DataCollectStage(props: DataCollectStageProps) {
  const [state, setState] = useState<DataCollectStageState>({});
  const [errorState, setErrorState] = useState<DataCollectStageErrorState>({});

  async function handleSubmit() {
    const { filePath, sheetName, month } = state;
    const newErrorState: DataCollectStageErrorState = {};

    if (!filePath || !sheetName || !month) {
      if (!filePath) newErrorState.filePath = 'Escala do Mês é um campo obrigatório';
      if (!sheetName) newErrorState.sheetName = 'Nome da Aba é um Campo obrigatório';
      if (!month) newErrorState.month = 'Mês é um Campo obrigatório';

      return setErrorState(newErrorState);
    }

    const error = await window.api.loadData(filePath, sheetName, month);

    if (error) {
      Object.setPrototypeOf(error, Error.prototype);
      props.onError?.(error);
    } else {
      props.onSuccess?.();
    }
  }

  async function handleFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const filePath = ev.currentTarget.files?.item(0)?.path;
    if (!filePath) return;

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
    const stringMonth = ev.currentTarget.value.split('-').at(1);
    if (!stringMonth) return;

    const month = +stringMonth - 1;

    setState({ ...state, month });
  }

  const message = errorState.filePath ?? errorState.sheetName ?? errorState.month;

  if (message) {
    alert(message);
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