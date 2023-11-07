import { editor } from "@gde/renderer/api";
import { EditorTypeSelect } from "@gde/renderer/components/EditorTypeSelect";
import { EditorContext } from "@gde/renderer/components/EditorTypeSelect/context";
import { useRulesModal } from "@gde/renderer/components/RulesModal";
import { useSaveTableModal } from "@gde/renderer/components/SaveTableModal";
import { useStage } from "@gde/renderer/contexts/stages";
import React, { useEffect } from "react";
import { AiOutlineSave } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from 'react-icons/bs';
import { GoTriangleDown } from 'react-icons/go';
import { StyledEditTableStageBody, StyledSelector, StyledToolsSection } from "./EditTableStage.styles";

export function EditTableStage() {
  const { prev } = useStage();
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();
  const table = EditorContext.useEditor();
  const changeEditor = EditorContext.useNavigate();
  const clearEditor = EditorContext.useClearEditor();

  function handleSaveAs() {
    if (!table) return;

    saveModal.open({ table });
  }

  function handleOpenRulesModal() {
    if (!table) return;

    rulesModal.open({ table });
  }

  useEffect(() => {
    return () => {
      clearEditor();
    }
  }, []);

  async function handlePrev() {
    prev();
  }

  return (
    <StyledEditTableStageBody>
      <StyledToolsSection>
        <button onClick={handlePrev}><BsArrowReturnLeft />Voltar</button>
        <button onClick={handleSaveAs}><AiOutlineSave />Salvar</button>
        <button onClick={handleOpenRulesModal}><BsGear />Regras</button>
        <StyledSelector>
          Editores
          <GoTriangleDown />
          <section className="selection-section">
            <button onClick={() => changeEditor('DutyTableGrid')}>Calendário</button>
            <button onClick={() => changeEditor('WorkerList')}>Lista</button>
          </section>
        </StyledSelector>
      </StyledToolsSection>
      <section className='editor-section'>
        <EditorTypeSelect />
      </section>
    </StyledEditTableStageBody>
  );
}