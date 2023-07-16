// @ts-nocheck
import { useEffect, useState } from "react";
import { LoadedData } from "../../app/api/channels";
import { SaveWorkersDaysOfWorkStatus } from "../../app/api/status";

export default function useLoadedData() {
  const [data, setData] = useState<LoadedData>();

  useEffect(() => {
    window.api.getLoadedData()
      .then(setData);
  }, []);

  function reloadData() {
    return window.api.getLoadedData()
      .then(setData);
  }

  async function saveData() {
    if (!data) return SaveWorkersDaysOfWorkStatus.UNKNOWN_ERROR;

    return window.api.saveWorkersDaysOfWork(data.workers);
  }

  return { data, reloadData, saveData };
}
