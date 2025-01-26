import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import { useSaveTableModal } from "../../SaveTableModal";

export function SaveScheduleButton() {
  const modal = useSaveTableModal();

  function handleSave() {
    modal.open();
  }

  return (
    <button onClick={handleSave}>
      <AiOutlineSave />
      Salvar
    </button>
  );
}
