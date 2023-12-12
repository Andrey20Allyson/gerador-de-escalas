import React from "react";
import { TableEditorController } from "../../state/controllers/editor/table";
import { FaRedo, FaUndo } from "react-icons/fa";
import { StyledHistoryTravelButton } from "./HistoryTravel.style";

export interface HistoryTravelButtonProps {
  direction: 'redo' | 'undo';
}

export function HistoryTravelButton(props: HistoryTravelButtonProps) {
  const { direction } = props;

  const tableController = TableEditorController.useOptional();

  function canExecute(): boolean {
    if (tableController === null) return false;

    switch (direction) {
      case "redo":
        return tableController.canRedo();
      case "undo":
        return tableController.canUndo();
    }
  }

  function handleClick() {
    if (tableController === null) return;

    switch (direction) {
      case "redo":
        return tableController.redo();
      case "undo":
        return tableController.undo();
    }
  }

  return (
    <StyledHistoryTravelButton className={canExecute() ? '' : 'disabled'} onClick={handleClick}>
      {direction === 'redo' ? <FaRedo /> : <FaUndo />}
    </StyledHistoryTravelButton>
  );
}