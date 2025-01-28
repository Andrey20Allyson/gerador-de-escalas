import React, { useEffect } from "react";
import { EditorToolBar } from "src/renderer/components/EditorToolBar";
import { AppError, api, editor } from "../../api";
import { EditorTypeSelect } from "../../components/EditorTypeSelect";
import { EditorRouterContext } from "../../components/EditorTypeSelect/context";
import { useRulesModal } from "../../components/RulesModal";
import { useSaveTableModal } from "../../components/SaveTableModal";
import { useStage } from "../../contexts/stages";
import { useKeyDownEvent } from "../../hooks";
import { TableEditorController } from "../../state/controllers/editor/table";
import { StyledEditTableStageBody } from "./EditTableStage.styles";

export const HISTORY_TRAVEL_CODE = "KeyZ";

export function isHistoryTravel(ev: KeyboardEvent) {
  return ev.code === HISTORY_TRAVEL_CODE && ev.ctrlKey;
}

export function EditTableStage() {
  const stage = useStage();
  const rulesModal = useRulesModal();
  const changeEditor = EditorRouterContext.useNavigate();
  const tableController = TableEditorController.useOptional();

  function handleOpenRulesModal() {
    rulesModal.open();
  }

  async function handleGenerate() {
    if (tableController == null) {
      throw new Error("table state not loaded");
    }

    const oldState = tableController.table;

    const generationResult = await api.editor.generate(oldState);

    if (generationResult.ok === false) {
      return AppError.log(generationResult.error);
    }

    const newState = generationResult.data;

    tableController.setState(newState);
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

  async function handleExit() {
    if (tableController === null) return;

    tableController.clear();

    stage.navigate(0);
  }

  return (
    <StyledEditTableStageBody>
      <EditorToolBar
        onExit={handleExit}
        onGenerate={handleGenerate}
        onChangeEditor={changeEditor}
        onOpenRulesModal={handleOpenRulesModal}
      />
      <section className="editor-section">
        <EditorTypeSelect />
      </section>
    </StyledEditTableStageBody>
  );
}
