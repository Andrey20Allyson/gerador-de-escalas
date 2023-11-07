import React from "react";
import { StageProvider, StageRouter } from "@gde/renderer/contexts/stages";
import { DataCollectStage } from "./DataCollectStage";
import { WorkerEditionStage } from "./WorkerEditionStage";

export default function Generator() {
  return (
    <StageProvider>
      <StageRouter stages={[
        DataCollectStage,
        WorkerEditionStage,
      ]} />
    </StageProvider>
  );
}