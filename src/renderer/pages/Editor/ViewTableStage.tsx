import React from "react";
import { DutyTableGrid } from "../../components/DutyTableGrid";
import { useStage } from "../../contexts/stages";
import useTableViewer from "../../hooks/useTableViewer";
import { Footer } from "../Generator/WorkerEditionStage.styles";

export function EditTableStage() {
  const { prev } = useStage();
  const table = useTableViewer();

  function handleSave() {

  }

  return (
    <>
      {table && <DutyTableGrid table={table} />}
      <Footer>
        <input type='button' onClick={prev} value='Voltar' />
        <input type='button' onClick={handleSave} value='Salvar' />
      </Footer>
    </>
  );
}