import React, { useRef } from "react";
import { TableEditor } from "../../../app/api/table-edition";
import { editor } from "../../api";
import { DayEditionModalProvider } from "../../components/DayEditionModal";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { Footer, StageBody } from "../Generator/WorkerEditionStage.styles";
import { useRulesModal } from "../../components/RulesModal";

export function EditTableStage() {
  const { prev } = useStage();
  const tableRef = useRef<TableEditor>(null);
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();

  function handleSaveAs() {
    const table = tableRef.current;
    if (!table) return alert('Não há nenhuma tabela carregada!');

    saveModal.open({ table });
  }

  function handleOpenRulesModal() {
    const table = tableRef.current;
    if (!table) return alert('Não há nenhuma tabela carregada!');

    rulesModal.open({ table });
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
          <input type='button' onClick={handleSaveAs} value='Salvar Como' />
          <input className='change-rules-button' type='button' onClick={handleOpenRulesModal} value='Configurar Regras' />
        </Footer>
      </StageBody>
    </DayEditionModalProvider>
  );
}