import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { LoadTableEditorStage } from "./LoadTableEditorStage";
import { EditTableStage } from "./EditTableStage";

export default function Editor() {
  return (
    <StageProvider>
      <StageRouter stages={[
        LoadTableEditorStage,
        EditTableStage,
      ]} />
      <StageLoadBar />
    </StageProvider>
  );
}