import React from "react";
import { StageComponent, StageProvider, StageRouter, StageLoadBar } from "../../contexts/stages";
import { DataCollectStage } from "./DataCollectStage";
import { GenerateStage } from "./GenerateStage";
import { WorkerEditionStage } from "./WorkerEditionStage";

export default function Generator() {
  const stages: StageComponent[] = [
    DataCollectStage,
    WorkerEditionStage,
    GenerateStage,
  ];

  return (
    <StageProvider>
      <StageRouter stages={stages} />
      <StageLoadBar />
    </StageProvider>
  );
}