import styled, { css } from "styled-components";

export const StageHeader = styled.header`
  display: flex;
  gap: 1rem;
`;

export interface ColoredTextProps {
  color: string;
}

export const ColoredText = styled.label<ColoredTextProps>`
  color: ${(props) => props.color};
  font-weight: bold;
`;

export const HelpIcon = styled.label`
  border-radius: 50%;
  border-width: 1px;
  border-color: #0004;
  border-style: solid;
  width: 1rem;
  height: 1rem;
  justify-content: center;
  align-items: center;
  display: flex;
  position: relative;
  cursor: pointer;

  &::before {
    content: '?';
  }

  &>* {
    position: absolute;
    background-color: #ebebeb;
    padding: .5rem;
    visibility: hidden;
    border-style: solid;
    width: max-content;
    border-width: 1px;
    border-color: #0004;
    box-shadow: -.2rem .2rem .4rem #0004;
    z-index: 2;
  }

  &:hover>* {
    visibility: visible;
    top: 70%;
    right: 70%;
  }
`;

export const StageBody = styled.div`
  display: flex;
  gap: 1rem;
  flex-direction: column;
  align-items: center;
`;

export const Footer = styled.footer`
  display: flex;
  gap: 1rem;
`;

export const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .4rem;
  background-color: #cecece;
  padding: .4rem;

`;

export interface DayCellProps {
  isWorkDay?: boolean;
}

export function normalBackgroundColorFunction(props: DayCellProps) {
  return props.isWorkDay ? '#aaaaaa' : '#06bb00';
}

export function hovererBackgroundColorFunction(props: DayCellProps) {
  return props.isWorkDay ? '#8a8a8a' : '#015200';
}

export const shadowStyles = css`
  box-shadow: -.2rem .2rem .4rem #0003;
`;

export const dayCellStyles = css`
  ${shadowStyles}
  width: 1.5rem;
  height: 1.5rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-color: #0002;
  border-width: 1px;
  border-style: solid;
`;

export const DayCell = styled.div`
  ${dayCellStyles}
  background-color: #3d3d3d;
  opacity: .2;
`;

export const WorkDayCell = styled.div<DayCellProps>`
  ${dayCellStyles}
  background-color: ${normalBackgroundColorFunction};
  cursor: pointer;

  &:hover {
    background-color: ${hovererBackgroundColorFunction};
  }
`;