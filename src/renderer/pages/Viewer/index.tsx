import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { LoadTableViewerStage } from "./LoadTableViewerStage";
import { ViewTableStage } from "./ViewTableStage";

export default function Viewer() {
  return (
    <StageProvider>
      <StageRouter stages={[
        LoadTableViewerStage,
        ViewTableStage,
      ]} />
      <StageLoadBar />
    </StageProvider>
  );
}