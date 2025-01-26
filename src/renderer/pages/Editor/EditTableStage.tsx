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
      <EditorToolBar
        onPrev={handlePrev}
        onSave={handleSaveAs}
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
