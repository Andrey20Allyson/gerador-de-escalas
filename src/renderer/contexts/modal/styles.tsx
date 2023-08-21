import styled from "styled-components";

export interface StyledModalBackGroundProps {
  closing?: boolean;
}

export const StyledModalBackground = styled.section<StyledModalBackGroundProps>`
  @keyframes modal-open {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  
  @keyframes modal-close {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  z-index: 99;
  position: fixed;
  width: 100vw;
  height: 100vh;
  left: 0;
  top: 0;
  background-color: #00000061;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: ${props => props.closing ? 'modal-close' : 'modal-open'} 200ms;
  opacity: ${props => props.closing ? 0 : 1};
`;
