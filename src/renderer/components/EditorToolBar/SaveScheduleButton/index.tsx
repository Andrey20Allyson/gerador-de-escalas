import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import { api } from "src/renderer/api";
import { TableEditorController } from "src/renderer/state/controllers/editor/table";

export function SaveScheduleButton() {
  const tableController = new TableEditorController();

  // async function serialize() {
  //   const saveResponse = await api.editor.save(tableController.table);
  //   if (!saveResponse.ok) return saveResponse;

  //   return api.editor.serialize('');
  // }

  function handleSave() {}

  return (
    <button onClick={handleSave}>
      <AiOutlineSave />
      Salvar Como
    </button>
  );
}
