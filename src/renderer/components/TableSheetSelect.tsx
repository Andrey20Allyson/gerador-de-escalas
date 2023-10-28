import { AppError, api } from "@gde/renderer/api";
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

    const response = await api.utils.getSheetNames(filePath);
    if (!response.ok) return AppError.log(response.error);

    const sheetNames = response.data;
    const sheetName = sheetNames.at(0);
    if (!sheetName) return alert(`O arquivo em '${filePath}' não é um arquivo excel válido!`);

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