import React from "react";
import styled from "styled-components";

type StyledRefType<E> = ((instance: E | null) => void) | React.RefObject<E> | null | undefined;
type OmitRef<P extends { ref?: any }> = Omit<P, 'ref'>;

export interface ScrollableProps extends React.PropsWithChildren, OmitRef<React.ComponentProps<'section'>> {
  bodyRef?: StyledRefType<HTMLElement>;
  scrollableRef?: StyledRefType<HTMLElement>;
}

export function Scrollable(props: ScrollableProps) {
  const {
    scrollableRef,
    children,
    bodyRef,
    ...rest
  } = props;

  return (
    <StyledScrollable ref={bodyRef} {...rest}>
      <span ref={scrollableRef} className="scrollable">
        {children}
      </span>
    </StyledScrollable>
  );
}

export const StyledScrollable = styled.section`
  position: relative;
  overflow-y: hidden;

  & .scrollable {
    box-sizing: content-box;
    overflow-y: scroll;
    position: absolute;
    width: 100%;
    height: 100%;

    &::-webkit-scrollbar {
      background-color: #ffffff81;
      width: .5rem;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #ffffffb0;
      border-radius: .3rem;
    }
  }
`;