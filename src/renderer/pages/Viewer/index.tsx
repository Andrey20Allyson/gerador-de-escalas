import React from "react";
import { StageLoadBar, StageProvider, StageRouter } from "../../contexts/stages";



export default function Viewer() {
  return (
    <StageProvider>
      <StageRouter stages={[]} />
      <StageLoadBar />
    </StageProvider>
  );
}