import React, { useRef } from "react";
import { TableEditor } from "../../../app/api/table-edition";
import { editor } from "../../api";
import { DayEditionModalProvider } from "../../components/DayEditionModal";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { Footer, StageBody } from "../Generator/WorkerEditionStage.styles";

export function EditTableStage() {
  const { prev } = useStage();
  const tableRef = useRef<TableEditor>(null);
  const modal = useSaveTableModal();

  function handleSaveAs() {
    const table = tableRef.current;
    if (!table) return alert('Não há nenhuma tabela carregada!');

    modal.open({ table });
  }

  async function handlePrev() {
    await editor.clear();

    prev();
  }

  return (
    <DayEditionModalProvider>
      <StageBody>
        <EditorTypeSelect tableRef={tableRef} />
        <Footer>
          <input type='button' onClick={handlePrev} value='Voltar' />
          <input type='button' onClick={handleSaveAs} value='Salvar como' />
        </Footer>
      </StageBody>
    </DayEditionModalProvider>
  );
}