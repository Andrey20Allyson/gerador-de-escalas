import React, { useEffect, useState } from "react";

export type CardFactory = () => React.ReactNode;
export type CanShowCardTest = () => boolean;

export interface InfoCardState {
  show(): void;
  hide(): void;
  onlyIf(test: CanShowCardTest): void;
  isVisible(): boolean;
  exibitionRequested: boolean;
  actived: boolean;
  hiding: boolean;
}

export function useInfoCard(): InfoCardState {
  const [exibitionRequested, setExibitionRequested] = useState(false);
  const [actived, setActived] = useState(false);
  const [hiding, setHiding] = useState(false);
  const tests: CanShowCardTest[] = [];

  useEffect(() => {
    if (!exibitionRequested) {
      setHiding(true);

      const timeout = setTimeout(() => {
        setHiding(false);
        setActived(false);
      }, 500);

      return () => {
        clearTimeout(timeout);
      };
    }

    const timeout = setTimeout(() => {
      setHiding(false);
      setActived(true);
    }, 500);

    return () => {
      clearTimeout(timeout);
    };
  }, [exibitionRequested]);

  function show() {
    setExibitionRequested(true);
  }

  function hide() {
    setExibitionRequested(false);
  }

  function onlyIf(test: CanShowCardTest) {
    tests.push(test);
  }

  onlyIf(() => actived);

  function isVisible(): boolean {
    for (const test of tests) {
      const result = test();

      if (result === false) {
        return false;
      }
    }

    return true;
  }

  return {
    hide,
    show,
    onlyIf,
    isVisible,
    exibitionRequested,
    actived,
    hiding,
  };
}
