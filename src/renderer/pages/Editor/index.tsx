import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { LoadTableStage } from "./LoadTableStage";
import { EditTableStage } from "./EditTableStage";

export default function Editor() {
  return (
    <StageProvider>
      <StageRouter stages={[
        LoadTableStage,
        EditTableStage,
      ]} />
      <StageLoadBar />
    </StageProvider>
  )
}