import styled from "styled-components";

interface LoadBarProps {
  steps: number;
  actual?: number;
}

function loadBarBackgroundColor(props: LoadBarProps) {
  return (props.actual ?? 0) >= props.steps ? "#00eeff" : "#337733";
}

export const LoadBar = styled.span<LoadBarProps>`
  width: 100%;
  height: 4px;
  margin-top: 2rem;

  background-color: #d1d1d1;

  display: flex;

  &::after {
    content: "";
    border-radius: 4px;
    transition:
      width 900ms,
      background-color 900ms;
    background-color: ${loadBarBackgroundColor};
    box-shadow: -0.1rem 0.1rem 0.2rem #0a380065;
    height: 100%;
    width: ${(props) => ((props.actual ?? 0) / props.steps) * 100 + 2}%;
  }
`;
