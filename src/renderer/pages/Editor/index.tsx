import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { LoadTableStage } from "./LoadTableStage";

export default function Editor() {
  return (
    <StageProvider>
      <StageRouter stages={[
        LoadTableStage
      ]} />
      <StageLoadBar />
    </StageProvider>
  )
}