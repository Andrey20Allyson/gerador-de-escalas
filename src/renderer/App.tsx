import React, { useState } from 'react';
import { DataCollectStage } from './components/DataCollectStage';
import { LoadBar } from './components/LoadBar';
import './App.css';
import { WorkerEditionStage } from './components/WorkerEditionStage';

export default function App() {
  const [stage, setStage] = useState(1);

  const stages: React.ReactElement[] = [];

  stages[0] = <DataCollectStage onSuccess={() => setStage(1)} />;
  stages[1] = <WorkerEditionStage onSuccess={() => { }} />;

  return (
    <main className='main-body'>
      <div className="inner-main">
        <div className="title-div">
          <img src="./assets/images/brasao.png" alt="" />
          <h1>Gerador de Escalas</h1>
        </div>
        <div className="screen-body">
          {stages.at(stage) ?? 'Erro 404 - estágio inválido!'}
          <LoadBar steps={stages.length} actual={stage + 1} />
        </div>
      </div>
    </main>
  )
}