import styled, { css } from "styled-components";

export interface StyledNavButtonProps {
  selected?: boolean;
}

export const selectedBackground = css`
  background-color: #f3f3f3;
  color: #014b1d;
`;

export const normalBackground = css`
  background-color: #fff0;
`;

export const hoveredBackground = css`
  background-color: #fff1;
`;

export const StyledNavButton = styled.span<StyledNavButtonProps>`
  color: #ffffff;
  ${(props) => props.selected ? selectedBackground : normalBackground}
  padding: .1rem .7rem;
  transition: background-color 200ms, color 200ms;
  user-select: none;
  display: flex;
  align-items: center;
  cursor: pointer;
  margin: 0;

  &:hover {
    ${props => props.selected ? selectedBackground : hoveredBackground}
  }
`;

export const AppBody = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const BodyCard = styled.main`
  margin: 0;
  display: flex;
  height: 100%;
  min-width: 70%;
  flex-direction: column;
  justify-content: center;
  background-color: #cccccc;
  box-shadow: -.2rem .2rem .5rem #0004;
  align-items: center;
  transition: height 1000ms;
  flex: 1;
`;

export function lineBorder(color: string) {
  return css`
    border-width: 1px;
    border-style: solid;
    border-color: ${color};
  `;
}

export const TopNav = styled.nav`
  border-bottom: none;
  z-index: 0;
  display: flex;
  padding: 0 1rem;
  height: 2.1rem;
  background-color: #014b1d;
  color: #000000;
  gap: .2rem;
  box-shadow: 0 .2rem .3rem #0005;
`;