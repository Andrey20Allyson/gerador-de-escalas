import React from "react";
import { AiOutlineSave } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from 'react-icons/bs';
import { GoTriangleDown } from 'react-icons/go';
import styled from "styled-components";
import { editor } from "../../api";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { EditorContext } from "../../components/EditorTypeSelect/context";
import { useRulesModal } from "../../components/RulesModal";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { StyledEditTableStageBody, StyledToolsSection, StyledSelector } from "./EditTableStage.styles";

export function EditTableStage() {
  const { prev } = useStage();
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();
  const table = EditorContext.useEditor();
  const changeEditor = EditorContext.useNavigate();

  function handleSaveAs() {
    if (!table) return;

    saveModal.open({ table });
  }

  function handleOpenRulesModal() {
    if (!table) return;

    rulesModal.open({ table });
  }

  async function handlePrev() {
    await editor.clear();

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