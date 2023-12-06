import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from "react";
import { LoadBar } from "../components/LoadBar";

export type StageComponent = () => React.JSX.Element;

export interface StageController {
  stages: StageComponent[];
  index: number,

  setStages(stages: StageComponent[]): void;
  navigate(stage: number): void;
  prev(): void;
  next(): void;
}

const stageContext = createContext<StageController | null>(null);

export function useStage() {
  const controller = useContext(stageContext);
  if (controller === null) throw new Error(`'useStages' must be inside a StageProvider`);

  return controller;
}

export function useStageControllerCreator(): StageController {
  const [stages, setStages] = useState<StageComponent[]>([]);
  const [index, setIndex] = useState(0);

  const controller: StageController = {
    index,
    stages,
    setStages,
    navigate,
    prev,
    next,
  };

  function navigate(stage: number): void {
    setIndex(stage);
  }

  function prev(): void {
    const prevStage = index - 1;
    if (prevStage < 0) return;

    setIndex(prevStage);
  }

  function next(): void {
    const nextStage = index + 1;
    if (nextStage >= stages.length) return;

    setIndex(nextStage);
  }

  return controller;
}

export function StageProvider(props: PropsWithChildren) {
  const controller = useStageControllerCreator();

  return (
    <stageContext.Provider value={controller} >
      {props.children}
    </stageContext.Provider>
  )
}

export interface StageRouterProps {
  stages: StageComponent[];
}

export function StageRouter(props: StageRouterProps) {
  const { stages, index, setStages } = useStage();

  useEffect(() => {
    setStages(props.stages);
  });

  const Stage = stages.at(index) ?? (() => undefined);

  return <Stage />
}

export function StageLoadBar() {
  const { stages, index } = useStage();

  return <LoadBar steps={stages.length - 1} actual={index} />
}