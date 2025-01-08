import React, { PropsWithChildren, Children } from "react";
import styled from "styled-components";

export interface RowProps extends PropsWithChildren {
  separator?: "line";
  contentJustify?: React.CSSProperties["justifyContent"];
}

export function Row(props: RowProps) {
  const { children, separator, contentJustify } = props;

  const childrenWithLines = Children.map(children, (child, index) => {
    return (
      <>
        {separator === "line" && index > 0 ? <StyledVerticalLine /> : undefined}
        {child}
      </>
    );
  });

  return (
    <StyledRow style={{ justifyContent: contentJustify }}>
      {childrenWithLines}
    </StyledRow>
  );
}

export const StyledRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.4rem;
`;

export const StyledVerticalLine = styled.span`
  width: 1px;
  background-color: #0002;
`;
