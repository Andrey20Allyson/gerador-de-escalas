import { AppError, api } from "../api";
import { useEffect, useState } from "react";

export function useServiceUnlocker() {
  const [isLocked, setLocked] = useState(true);
  const [error, setError] = useState<AppError<unknown>>();

  async function isServicesLocked(): Promise<boolean> {
    const isLocked = await api.isServicesLocked();
    if (!isLocked.ok) AppError.throwError(isLocked.error);

    return isLocked.data;
  }

  useEffect(() => {
    isServicesLocked()
      .then(isLocked => {
        if (isLocked) return;

        setLocked(false);
      });
  }, []);

  async function unlock(password: string) {
    const result = await api.unlockServices(password);
    if (result.ok === false) {
      setError(result.error);
      return;
    }

    const isLocked = await isServicesLocked();
    if (isLocked) {
      alert('Services still locked!');
      return;
    }

    setLocked(false);
  }

  return { isLocked, unlock, error };
}