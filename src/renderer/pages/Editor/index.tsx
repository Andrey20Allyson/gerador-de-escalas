import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { LoadTableViewerStage } from "./LoadTableViewerStage";
import { EditTableStage } from "./ViewTableStage";

export default function Editor() {
  return (
    <StageProvider>
      <StageRouter stages={[
        LoadTableViewerStage,
        EditTableStage,
      ]} />
      <StageLoadBar />
    </StageProvider>
  );
}