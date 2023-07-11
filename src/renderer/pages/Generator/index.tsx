import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";
import { DataCollectStage } from "./DataCollectStage";
import { WorkerEditionStage } from "./WorkerEditionStage";

export default function Generator() {
  return (
    <StageProvider>
      <StageRouter stages={[
        DataCollectStage,
        WorkerEditionStage,
      ]} />
      <StageLoadBar />
    </StageProvider>
  );
}