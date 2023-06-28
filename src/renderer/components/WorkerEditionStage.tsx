import { DaysOfWork } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/parsers/days-of-work";
import { WorkTime } from '@andrey-allyson/escalas-automaticas/dist/extra-duty-table/parsers/work-time';
import { WorkerInfo } from "@andrey-allyson/escalas-automaticas/dist/extra-duty-table/worker-info";
import React, { useEffect, useState } from "react";

export interface WorkerEditionStageProps {
  onSuccess?: () => void;
}

export function WorkerEditionStage(props: WorkerEditionStageProps) {
  const [workers, setWorkers] = useState<WorkerInfo[]>();

  useEffect(() => {
    async function loadWorkers() {
      const workers = await window.api.getWorkerInfo();

      if (!workers) return;

      for (const worker of workers) {
        Object.setPrototypeOf(worker, WorkerInfo.prototype);
        Object.setPrototypeOf(worker.daysOfWork, DaysOfWork.prototype);
        Object.setPrototypeOf(worker.workTime, WorkTime.prototype);
      };

      setWorkers(workers);
    }

    loadWorkers();
  }, []);

  return (
    <>
      <select>
        {workers && workers.map((worker, i) => <option key={i} value={i}>{worker.config.name}</option>)}
      </select>
    </>
  );
}