import { useState } from "react";
import { AppError, api } from "../api";

export function useServiceUnlocker() {
  const [isLocked, setLocked] = useState(true);

  async function unlock(password: string) {
    const result = await api.unlockServices(password);
    if (result.ok === false) {
      AppError.log(result.error);
      return;
    }

    const isLocked = await api.isServicesLocked();
    if (!isLocked.ok) AppError.throwError(isLocked.error);

    if (isLocked.data === true) {
      alert('Services still locked!');
      return;
    }

    setLocked(false);
  }

  return { isLocked, unlock };
}