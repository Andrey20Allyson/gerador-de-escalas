import React from "react";
import {
  StyledSelector,
  StyledToolsSection,
} from "src/renderer/pages/Editor/EditTableStage.styles";
import { UndoButton } from "src/renderer/components/RedoNUndoButtons/Undo";
import { RedoButton } from "src/renderer/components/RedoNUndoButtons/Redo";
import { EditorRouterContext } from "../EditorTypeSelect/context";
import { RouterContext } from "src/renderer/contexts/router";
import { BsArrowReturnLeft, BsGear } from "react-icons/bs";
import { AiOutlineClockCircle, AiOutlineSave } from "react-icons/ai";
import { GoTriangleDown } from "react-icons/go";

type EditorRouterKey =
  typeof EditorRouterContext extends RouterContext<infer TRoutes>
    ? keyof TRoutes
    : never;

export interface EditorToolBarProps {
  onPrev?: () => void;
  onSave?: () => void;
  onOpenRulesModal?: () => void;
  onChangeEditor?: (key: EditorRouterKey) => void;
  onGenerate?: () => void;
}

export function EditorToolBar(props: EditorToolBarProps) {
  return (
    <StyledToolsSection>
      <UndoButton />
      <RedoButton />
      <button onClick={props.onPrev}>
        <BsArrowReturnLeft />
        Voltar
      </button>
      <button onClick={props.onSave}>
        <AiOutlineSave />
        Salvar
      </button>
      <button onClick={props.onOpenRulesModal}>
        <BsGear />
        Regras
      </button>
      <StyledSelector>
        Editores
        <GoTriangleDown />
        <section className="selection-section">
          <button onClick={() => props.onChangeEditor?.("DutyTableGrid")}>
            Calendário
          </button>
          <button onClick={() => props.onChangeEditor?.("WorkerList")}>
            Lista
          </button>
        </section>
      </StyledSelector>
      <button onClick={props.onGenerate}>
        <AiOutlineClockCircle />
        Gerar
      </button>
    </StyledToolsSection>
  );
}
