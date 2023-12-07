import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { useRulesModal } from "../../components/RulesModal";
import { useSaveTableModal } from "../../components/SaveTableModal";
import React, { useEffect } from "react";
import { AiOutlineSave } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from 'react-icons/bs';
import { GoTriangleDown } from 'react-icons/go';
import { useStage } from "../../contexts/stages";
import { StyledEditTableStageBody, StyledSelector, StyledToolsSection } from "./EditTableStage.styles";
import { EditorRouterContext } from "../../components/EditorTypeSelect/context";
import { TableEditorController } from "../../state/controllers/editor/table-editor";

export function EditTableStage() {
  const { prev } = useStage();
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();
  const tableController = new TableEditorController();
  const changeEditor = EditorRouterContext.useNavigate();

  console.log('EditTableStage:', tableController.table.dutyAndWorkerRelationships);

  function handleSaveAs() {
    if (!tableController) return;

    saveModal.open();
  }

  function handleOpenRulesModal() {
    if (!tableController) return;

    rulesModal.open();
  }

  useEffect(() => {
    return () => {
      tableController.clear();
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