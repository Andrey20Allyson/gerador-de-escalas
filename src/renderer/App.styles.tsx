import styled, { css } from "styled-components";

export interface StyledNavButtonProps {
  selected?: boolean;
}

export const StyledNavButton = styled.span<StyledNavButtonProps>`
  padding: .1rem .7rem;
  background-color: ${(props) => props.selected ? '#2e9c1f' : '#afafaf'};
  transition: background-color 200ms;
  font-weight: bold;
  user-select: none;
  cursor: pointer;
  margin: 0;
  border-top-right-radius: .4rem;
  ${lineBorder('#a3a3a3')}

  &:hover {
    background-color: ${(props) => props.selected ? '#2e9c1f' : '#8db189'};
  }
`;

export const AppBody = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

export const BodyCard = styled.main`
  ${lineBorder('#777777')}
  margin: 0;
  display: flex;
  height: 100%;
  min-width: 70%;
  flex-direction: column;
  justify-content: center;
  background-color: #e4e4e4;
  border-radius: 0 0 1rem 1rem;
  padding: 10px;
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
  border: 1px solid #777;
  border-bottom: none;
  display: flex;
  padding: 0 1rem;
  border-radius: 1rem 1rem 0 0;
  background-color: #d6d6d6;
  color: #000000;
  gap: .2rem;
`;