import { useEffect } from "react";

export type OnKeyDown = (ev: KeyboardEvent) => void;

export function useKeyDownEvent(handler: OnKeyDown) {
  useEffect(() => {
    document.addEventListener('keydown', handler)

    return () => {
      document.removeEventListener('keydown', handler);
    }
  }, [handler]);
}
