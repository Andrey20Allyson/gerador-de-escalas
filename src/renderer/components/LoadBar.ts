import styled from "styled-components";

export const LoadBar = styled.span<{steps: number, actual?: number}>`
  width: 100%;
  height: 2px;
  margin-top: 2rem;

  background-color: #d1d1d1;

  display: flex;

  &::after {
    content: '';
    transition: width 200ms;
    background-color: #337733;
    box-shadow: -.1rem .1rem .2rem #0a380065;
    height: 100%;
    width: ${(props) => ((props.actual ?? 0) / props.steps) * 100}%;
  }
`