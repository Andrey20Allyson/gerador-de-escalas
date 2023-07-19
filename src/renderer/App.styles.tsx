import styled, { css } from "styled-components";

export interface StyledNavButtonProps {
  selected?: boolean;
}

export const selectedBackground = css`
  background-image: linear-gradient(40deg, #067411, #099209);
  background-color: #098809;
  color: #c5c5c5;
`;

export const normalBackground = css`
  background-color: #afafaf;
`;

export const StyledNavButton = styled.span<StyledNavButtonProps>`
  ${(props) => props.selected ? selectedBackground : normalBackground}
  padding: .1rem .7rem;
  transition: background-color 200ms;
  font-weight: bold;
  user-select: none;
  cursor: pointer;
  margin: 0;
  border-top-right-radius: .4rem;
  ${lineBorder('#a3a3a3')}

  &:hover {
    ${(props) => props.selected ? selectedBackground : 'background-color: #8db189;'}
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
  background-color: #a1a1a1;
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
  background-color: #494949;
  color: #000000;
  gap: .2rem;
`;