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

  & .change-rules-button {
    background-image: linear-gradient(90deg, #e7bd00, #e7a900);
    color: #000c;

    &:hover {
      color: #000
    }

    &:focus {
      border-color: #f5c235;
    }
  }
`;

export const Footer = styled.footer`
  display: flex;
  gap: 1rem;
`;

export const DayGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: .4rem;
  background-color: #49494942;
  border-radius: .2rem;
  padding: .4rem;
`;

export interface DayCellProps {
  isWorkDay?: boolean;
}

export function normalBackgroundColorFunction(props: DayCellProps) {
  return props.isWorkDay ? '#d3d3d3' : '#297a29';
}

export function hovererBackgroundColorFunction(props: DayCellProps) {
  return props.isWorkDay ? '#8a8a8a' : '#025a00';
}

export const shadowStyles = css`
  box-shadow: -.1rem .1rem .4rem #0002;
`;

export const dayCellStyles = css`
  ${shadowStyles}
  width: 2rem;
  height: 1.7rem;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  border-color: #0001;
  border-radius: .2rem;
  border-width: 1px;
  border-style: solid;
  transition: background-color 100ms, color 100ms;
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

  color: ${(props) => props.isWorkDay ? '#000' : '#eee'};
  ${(props) => props.isWorkDay ? '' : css`font-weight: bolder;`}
`;

export const HeaderLabel = styled.label`
  font-weight: bolder;
  font-size: 1.2rem;
`;