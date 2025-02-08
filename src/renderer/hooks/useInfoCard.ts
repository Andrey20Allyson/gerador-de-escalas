import React, { useEffect, useRef, useState } from "react";

export type CardFactory = () => React.ReactNode;

export interface InfoCardState {
  show(): void;
  hide(): void;
  whenVisible(factory: CardFactory): void;
  intoNode(): React.ReactNode;
  visible: boolean;
  parent: React.Ref<any>;
}

export function useInfoCard(): InfoCardState {
  const [visible, setVisible] = useState(false);
  const parentRef = useRef<HTMLElement>(null);
  let factory: CardFactory | null = null;

  useEffect(() => {
    const element = parentRef.current;

    if (element == null) {
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    element.addEventListener(
      "mouseenter",
      () => {
        setVisible(true);
      },
      { signal },
    );

    element.addEventListener(
      "mouseleave",
      () => {
        setVisible(false);
      },
      { signal },
    );

    element.style.position = "relative";

    return () => {
      controller.abort();
    };
  }, [parentRef]);

  function show() {
    setVisible(true);
  }

  function hide() {
    setVisible(false);
  }

  function whenVisible(newFactory: () => React.ReactNode) {
    factory = newFactory;
  }

  function intoNode(): React.ReactNode {
    return visible && factory != null ? factory() : null;
  }

  return {
    hide,
    show,
    whenVisible,
    intoNode,
    visible,
    parent: parentRef,
  };
}
