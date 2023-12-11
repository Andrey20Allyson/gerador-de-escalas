import React, { useEffect } from "react";
import { AiOutlineSave } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from 'react-icons/bs';
import { GoTriangleDown } from 'react-icons/go';
import { editor } from "../../api";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { EditorRouterContext } from "../../components/EditorTypeSelect/context";
import { useRulesModal } from "../../components/RulesModal";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { TableEditorController } from "../../state/controllers/editor/table";
import { StyledEditTableStageBody, StyledSelector, StyledToolsSection } from "./EditTableStage.styles";

export function EditTableStage() {
  const { prev } = useStage();
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();
  const changeEditor = EditorRouterContext.useNavigate();
  const tableController = new TableEditorController();

  function handleSaveAs() {
    saveModal.open();
  }

  function handleOpenRulesModal() {
    rulesModal.open();
  }

  useEffect(() => {
    return () => {
      tableController.clear();
    }
  }, []);

  async function handlePrev() {
    await editor.clear();
    tableController.clear();

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