import React, { JSX, PropsWithChildren, createContext, useContext, useState } from 'react';
import { StyledModalBackground } from './styles';

export type ModalLike<P = {}> = (props: P) => JSX.Element;
export type ModalProps<T extends ModalLike> = T extends ModalLike<infer P> ? P : never;

const EMPITY_PROPS = Symbol();
export type EmpityProps = typeof EMPITY_PROPS;

export interface InternModalContext<P> {
  props: P | EmpityProps;
  isClosing: boolean;
  isOpen: boolean;
  setProps(props: P | EmpityProps): void;
  close(): void;
  open(): void;
}

export function createModalContext<M extends ModalLike<any>>(Modal: M) {
  type ThisModalProps = ModalProps<M>;

  const ModalContext = createContext<InternModalContext<ThisModalProps> | null>(null);

  function ModalProvider(props: PropsWithChildren) {
    const [_props, setProps] = useState<ThisModalProps | EmpityProps>(EMPITY_PROPS);
    const [isOpen, setOpen] = useState(false);
    const [isClosing, setClosing] = useState(false);

    function open() {
      if (!isClosing) {
        setOpen(true);
      }
    }

    function close() {
      setClosing(true);
    }

    function handleAnimationEnd(ev: React.AnimationEvent<HTMLElement>) {
      if (ev.animationName === 'modal-close') {
        setOpen(false);
        setClosing(false);
      }
    }

    return (
      <ModalContext.Provider value={{ props: _props, isOpen, close, open, isClosing, setProps }}>
        {props.children}
        {isOpen && _props !== EMPITY_PROPS &&
          <StyledModalBackground closing={isClosing} onAnimationEnd={handleAnimationEnd}>
            <Modal {...(_props ?? {} as any)} />
          </StyledModalBackground>}
      </ModalContext.Provider>
    );
  }

  function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) throw new Error(`Can't use ${Modal.name}Context outside a Provider!`);

    return context;
  }

  function useModal() {
    const context = useModalContext();

    return new ModalHandler(context);
  }

  return { ModalProvider, useModal };
}

export class ModalHandler<P> {
  constructor(private context: InternModalContext<P>) { }

  open(props: P = {} as P) {
    if (props) {
      this.context.setProps(props);
    }

    this.context.open();
  }

  close() {
    this.context.close();
  }

  clearProps() {
    this.context.setProps(EMPITY_PROPS);
    this.context.close();
  }

  isClosing() {
    return this.isClosing;
  }
}