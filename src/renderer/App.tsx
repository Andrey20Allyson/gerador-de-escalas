import React, { useMemo, useState } from 'react';
import { MainBody } from './App.style';
import './App.css';
import { saveFile } from './utils/save-file';

interface AppFormState {
  filePath?: string;
  sheetName?: string;
  sheetNames?: string[];
  month?: number;
}

function createSheetNameOption(sheetName: string, key: number) {
  return <option key={key} value={sheetName}>{sheetName}</option>;
}

interface AppFormProps {
  onStateChange?: (state: AppFormState) => void;
}

function AppForm(props: AppFormProps) {
  const [state, setState] = useState<AppFormState>({});

  props.onStateChange?.(state);

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

  return (
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
  )
}

export default function App() {
  const memo = useMemo(() => {
    const formState: AppFormState = {};

    return {
      formState
    }
  }, []);

  async function handleSubmit() {
    const { filePath, sheetName, month } = memo.formState;

    if (filePath === undefined) {
      alert('Escala do Mês deve receber um arquivo!');
      return;
    }

    if (sheetName === undefined) {
      alert('Nome da Aba é um campo obrigatório!');
      return;
    }

    if (month === undefined) {
      alert('Mês é um campo obrigatório!');
      return;
    }

    const result = await window.api.generate(filePath, sheetName, month).catch(alert);
    if (!result) return;

    saveFile('result.xlsx', result);
  }

  function handleFormStateChange(state: AppFormState) {
    memo.formState = state;
  }

  return (
    <MainBody className='main-body'>
      <div className="inner-main">
        <div className="title-div">
          <img src="./assets/images/brasao.png" alt="" />
          <h1>Gerador de Escalas</h1>
        </div>
        <div className="screen-body">
          <AppForm onStateChange={handleFormStateChange} />
          <input type="submit" onClick={handleSubmit} className="submit-button" value="Salvar" />
        </div>
      </div>
    </MainBody>
  )
}