import React, { useState } from 'react';
import './App.css';
import { DataCollectStage } from './components/DataCollectStage';
import { GenerateStage } from './components/GenerateStage';
import { LoadBar } from './components/LoadBar';
import { WorkerEditionStage } from './components/WorkerEditionStage';

export default function App() {
  const [stage, setStage] = useState(2);

  const stages: React.ReactElement[] = [];

  stages[0] = <DataCollectStage onFinish={() => setStage(1)} />;
  stages[1] = <WorkerEditionStage onFinish={() => setStage(2)} onGoBack={() => setStage(0)} />;
  stages[2] = <GenerateStage onGoBack={() => setStage(1)} />

  return (
    <main className='main-body'>
      <div className="inner-main">
        <div className="title-div">
          <img src="./assets/images/brasao.png" alt="" />
          <h1>Gerador de Escalas</h1>
        </div>
        <div className="screen-body">
          {stages.at(stage) ?? 'Erro 404 - estágio inválido!'}
          <LoadBar steps={stages.length - 1} actual={stage} />
        </div>
      </div>
    </main>
  )
}