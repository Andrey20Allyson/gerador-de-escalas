import React from "react";
import { AiOutlineClockCircle } from "react-icons/ai";
import { BsArrowReturnLeft, BsGear } from "react-icons/bs";
import { GoTriangleDown } from "react-icons/go";
import { RedoButton } from "src/renderer/components/RedoNUndoButtons/Redo";
import { UndoButton } from "src/renderer/components/RedoNUndoButtons/Undo";
import { RouterContext } from "src/renderer/contexts/router";
import {
  StyledSelector,
  StyledToolsSection,
} from "src/renderer/pages/Editor/EditTableStage.styles";
import { EditorRouterContext } from "../EditorTypeSelect/context";
import { SaveScheduleAsButton } from "./SaveScheduleAsButton";

type EditorRouterKey =
  typeof EditorRouterContext extends RouterContext<infer TRoutes>
    ? keyof TRoutes
    : never;

export interface EditorToolBarProps {
  onExit?: () => void;
  onOpenRulesModal?: () => void;
  onChangeEditor?: (key: EditorRouterKey) => void;
  onGenerate?: () => void;
}

export function EditorToolBar(props: EditorToolBarProps) {
  return (
    <StyledToolsSection>
      <UndoButton />
      <RedoButton />
      <button onClick={props.onExit}>
        <BsArrowReturnLeft />
        Voltar
      </button>
      <SaveScheduleAsButton />
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
