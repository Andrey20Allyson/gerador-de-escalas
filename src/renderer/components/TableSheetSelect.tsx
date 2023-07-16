// @ts-nocheck
import React, { useState } from "react";

export interface TableSheetSelectState {
  sheetNames: string[];
  sheetName: string;
  filePath: string;
}

export interface TableSheetSelectProps {
  fileInputTitle: string;
  selectTitle: string;

  onChange?: (state: TableSheetSelectState | undefined) => void;
}

function createSheetNameOption(sheetName: string, key: number) {
  return <option key={key} value={sheetName}>{sheetName}</option>;
}

export function TableSheetSelect(props: TableSheetSelectProps) {
  const [state, setState] = useState<TableSheetSelectState>();
  
  props.onChange?.(state);

  async function handleFileChange(ev: React.ChangeEvent<HTMLInputElement>) {
    const filePath = ev.currentTarget.files?.item(0)?.path;
    if (!filePath) return;

    const sheetNames = await window.api.getSheetNames(filePath);

    const sheetName = sheetNames.at(0);
    if (!sheetName) return alert(`O arquivo selecionado não é um Excel válido!`);

    setState({ ...state, filePath, sheetNames, sheetName });
  }

  function handleSheetNameChange(ev: React.ChangeEvent<HTMLSelectElement>) {
    if (!state) return;

    setState({...state, sheetName: ev.currentTarget.value});
  }

  return (
    <>
      <label className="mandatory">{props.fileInputTitle}</label>
      <input type="file" onChange={handleFileChange} />
      <label className="mandatory">{props.selectTitle}</label>
      <select onChange={handleSheetNameChange}>{
        state && state.sheetNames && state.sheetNames.map(createSheetNameOption)
      }</select>
    </>
  );
}