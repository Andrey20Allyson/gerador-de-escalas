import { StageProvider, StageRouter } from "@gde/renderer/contexts/stages";
import React from "react";
import { EditTableStage } from "./EditTableStage";
import { LoadTableEditorStage } from "./LoadTableEditorStage";

export default function Editor() {
  return (
    <StageProvider>
      <StageRouter stages={[
        LoadTableEditorStage,
        EditTableStage,
      ]} />
    </StageProvider>
  );
}