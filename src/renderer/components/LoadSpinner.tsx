import styled, { css } from "styled-components";

export interface LoadSpinnerProps {
  spinnerWidth?: number | string;
  spinDuration?: number | string;
  size?: number | string;
  reverse?: boolean;
  visible?: boolean;
  color?: string;
}

export const LoadSpinner = styled.span<LoadSpinnerProps>`
  animation-name: spin-animation;
  animation-direction: ${({ reverse }) => reverse ? 'reverse' : 'normal'};
  animation-duration: ${({ spinDuration = 1.5 }) => typeof spinDuration === 'string' ? spinDuration : `${spinDuration}s`};
  animation-iteration-count: infinite;
  animation-timing-function: linear;
  border-color: #5757572d;
  border-top-color: ${({ color = '#f00' }) => color};
  border-radius: 50%;
  border-style: solid;
  border-width: ${({ spinnerWidth = 2 }) => typeof spinnerWidth === 'string' ? spinnerWidth : `${spinnerWidth}px`};
  visibility: ${({ visible = true }) => visible ? 'visible' : 'hidden'};

  ${({ size = 12 }) => {
    const sizeValue = typeof size === 'string' ? size : `${size}px`
    return css`
      width: ${sizeValue};
      height: ${sizeValue};
      `;
  }}

  @keyframes spin-animation {
    0% {
      transform: rotateZ(0deg);
    } 
    33% {
      transform: rotateZ(calc(360deg / 3));
    } 
    66% {
      transform: rotateZ(calc(360deg * 2 / 3));
    } 
    100% {
      transform: rotateZ(360deg);
    } 
  }
`;