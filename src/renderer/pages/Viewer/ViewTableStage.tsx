import React from "react";
import { DutyTableGrid } from "../../components/DutyTableGrid";
import { useStage } from "../../contexts/stages";
import useTableViewer from "../../hooks/useTableViewer";
import { Footer } from "../Generator/WorkerEditionStage.styles";

export function ViewTableStage() {
  const { prev } = useStage();
  const table = useTableViewer();

  return (
    <>
      {table && <DutyTableGrid table={table} />}
      <Footer>
        <input type='button' onClick={prev} value='Voltar' />
      </Footer>
    </>
  );
}