import React, { useEffect } from "react";
import { AiOutlineClockCircle, AiOutlineSave } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import { AppError, api, editor } from "../../api";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { EditorRouterContext } from "../../components/EditorTypeSelect/context";
import { useRulesModal } from "../../components/RulesModal";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { TableEditorController } from "../../state/controllers/editor/table";
import {
  StyledEditTableStageBody,
  StyledSelector,
  StyledToolsSection,
} from "./EditTableStage.styles";
import { UndoButton } from "../../components/RedoNUndoButtons/Undo";
import { RedoButton } from "../../components/RedoNUndoButtons/Redo";
import { useKeyDownEvent } from "../../hooks";

export const HISTORY_TRAVEL_CODE = "KeyZ";

export function isHistoryTravel(ev: KeyboardEvent) {
  return ev.code === HISTORY_TRAVEL_CODE && ev.ctrlKey;
}

export function EditTableStage() {
  const { prev } = useStage();
  const saveModal = useSaveTableModal();
  const rulesModal = useRulesModal();
  const changeEditor = EditorRouterContext.useNavigate();
  const tableController = TableEditorController.useOptional();

  function handleSaveAs() {
    saveModal.open();
  }

  function handleOpenRulesModal() {
    rulesModal.open();
  }

  async function handleGenerate() {
    await api.editor.generate();

    const newTableDataResult = await api.editor.createEditor();
    if (!newTableDataResult.ok) {
      return AppError.log(newTableDataResult.error);
    }

    tableController?.setState(newTableDataResult.data);
  }

  useEffect(() => {
    return () => {
      if (tableController !== null) {
        tableController.clear();
      }
    };
  }, []);

  useKeyDownEvent((ev) => {
    if (tableController === null) return;
    if (!isHistoryTravel(ev)) return;

    if (ev.shiftKey) {
      tableController.redo();
    } else {
      tableController.undo();
    }
  });

  async function handlePrev() {
    if (tableController === null) return;

    await editor.clear();
    tableController.clear();

    prev();
  }

  return (
    <StyledEditTableStageBody>
      <StyledToolsSection>
        <UndoButton />
        <RedoButton />
        <button onClick={handlePrev}>
          <BsArrowReturnLeft />
          Voltar
        </button>
        <button onClick={handleSaveAs}>
          <AiOutlineSave />
          Salvar
        </button>
        <button onClick={handleOpenRulesModal}>
          <BsGear />
          Regras
        </button>
        <StyledSelector>
          Editores
          <GoTriangleDown />
          <section className="selection-section">
            <button onClick={() => changeEditor("DutyTableGrid")}>
              Calendário
            </button>
            <button onClick={() => changeEditor("WorkerList")}>Lista</button>
          </section>
        </StyledSelector>
        <button onClick={handleGenerate}>
          <AiOutlineClockCircle />
          Gerar
        </button>
      </StyledToolsSection>
      <section className="editor-section">
        <EditorTypeSelect />
      </section>
    </StyledEditTableStageBody>
  );
}
