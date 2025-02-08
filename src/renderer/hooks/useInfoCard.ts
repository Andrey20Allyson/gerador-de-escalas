import React, { useState } from "react";

export type CardFactory = () => React.ReactNode;
export type CanShowCardTest = () => boolean;

export interface InfoCardState {
  show(): void;
  hide(): void;
  whenVisible(factory: CardFactory): void;
  onlyIf(test: CanShowCardTest): void;
  intoNode(): React.ReactNode;
}

export function useInfoCard(): InfoCardState {
  const [exibitionRequested, setExibitionRequested] = useState(false);
  let factory: CardFactory | null = null;
  const tests: CanShowCardTest[] = [];

  function show() {
    setExibitionRequested(true);
  }

  function hide() {
    setExibitionRequested(false);
  }

  function whenVisible(newFactory: () => React.ReactNode) {
    factory = newFactory;
  }

  function intoNode(): React.ReactNode {
    return isVisible() && factory != null ? factory() : null;
  }

  function onlyIf(test: CanShowCardTest) {
    tests.push(test);
  }

  onlyIf(() => exibitionRequested);

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
    whenVisible,
    intoNode,
    onlyIf,
  };
}
