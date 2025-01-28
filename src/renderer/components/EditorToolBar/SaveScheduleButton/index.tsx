import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import { api } from "src/renderer/api";
import { TableEditorController } from "src/renderer/state/controllers/editor/table";

export function SaveScheduleButton() {
  const tableController = new TableEditorController();

  async function save() {
    await api.editor.save(tableController.table);
  }

  return (
    <button onClick={save}>
      <AiOutlineSave />
      Salvar
    </button>
  );
}
